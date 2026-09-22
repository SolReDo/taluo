import { query } from '@/lib/mysql';
import bcrypt from 'bcryptjs';
import {
  getAllShortMemoryKeys,
  renameShortMemoryKey,
  upsertGuestSession,
  getGuestSession,
} from './shortTermMemory';
import { migrateLongTermMemoryUserId } from './longTermMemory';

interface User {
  id: string;
  openid: string | null;
  username: string | null;
  password_hash: string | null;
  is_guest: number;
}

/**
 * 创建游客账号
 */
export async function createGuestAccount(): Promise<string> {
  const { v4: uuidv4 } = await import('uuid');
  const guestId = uuidv4();

  await query(
    'INSERT INTO users (id, is_guest, created_at, updated_at) VALUES (?, 1, NOW(), NOW())',
    [guestId]
  );

  return guestId;
}

/**
 * 根据 openid 查找用户
 */
export async function findUserByOpenid(
  openid: string
): Promise<User | null> {
  const rows = await query<User[]>(
    'SELECT id, openid, is_guest FROM users WHERE openid = ? LIMIT 1',
    [openid]
  );
  return rows.length > 0 ? rows[0] : null;
}

/**
 * 根据 userId 查找用户
 */
export async function findUserById(userId: string): Promise<User | null> {
  const rows = await query<User[]>(
    'SELECT id, openid, is_guest FROM users WHERE id = ? LIMIT 1',
    [userId]
  );
  return rows.length > 0 ? rows[0] : null;
}

/**
 * 游客转正（openid 未注册的情况）
 */
export async function promoteGuestToUser(
  guestId: string,
  openid: string
): Promise<void> {
  await query(
    'UPDATE users SET openid = ?, is_guest = 0, updated_at = NOW() WHERE id = ? AND is_guest = 1',
    [openid, guestId]
  );
}

/**
 * 合并游客数据到已有账号（openid 已注册的情况）
 */
export async function mergeGuestToExistingUser(
  guestId: string,
  targetUserId: string
): Promise<void> {
  // 1. 迁移 Redis 短期记忆 key
  const guestKeys = await getAllShortMemoryKeys(guestId);
  for (const oldKey of guestKeys) {
    const sessionId = oldKey.split(':').pop();
    if (sessionId) {
      await renameShortMemoryKey(guestId, targetUserId, sessionId);
    }
  }

  // 2. 迁移 Qdrant 长期记忆的 user_id
  await migrateLongTermMemoryUserId(guestId, targetUserId);

  // 3. 迁移 MySQL 历史记录
  await query(
    'UPDATE archived_tarot_logs SET user_id = ? WHERE user_id = ?',
    [targetUserId, guestId]
  );

  // 4. 删除游客账号
  await query('DELETE FROM users WHERE id = ? AND is_guest = 1', [guestId]);
}

/**
 * 处理微信登录
 * 返回 { userId, isNewUser }
 */
export async function handleWechatLogin(
  guestId: string | null,
  code: string
): Promise<{ userId: string; isNewUser: boolean; isGuest: boolean }> {
  // TODO: 实际应该调用微信 API 换取 openid
  // const { openid } = await getWechatOpenId(code);
  // 这里暂时用模拟的 openid
  const openid = `wechat_${code}`;

  // 1. 查找是否有已有用户
  const existingUser = await findUserByOpenid(openid);

  if (!existingUser) {
    // 场景A：openid 未注册
    if (guestId) {
      // 当前有游客账号，转正
      await promoteGuestToUser(guestId, openid);
      return { userId: guestId, isNewUser: true, isGuest: false };
    } else {
      // 创建新账号
      const { v4: uuidv4 } = await import('uuid');
      const newUserId = uuidv4();
      await query(
        'INSERT INTO users (id, openid, is_guest, created_at, updated_at) VALUES (?, ?, 0, NOW(), NOW())',
        [newUserId, openid]
      );
      return { userId: newUserId, isNewUser: true, isGuest: false };
    }
  }

  // 场景B：openid 已存在（老用户）
  if (guestId && guestId !== existingUser.id) {
    // 合并游客数据到老账号
    await mergeGuestToExistingUser(guestId, existingUser.id);
    return { userId: existingUser.id, isNewUser: false, isGuest: false };
  }

  // 已是正式用户，直接返回
  return {
    userId: existingUser.id,
    isNewUser: false,
    isGuest: existingUser.is_guest === 1,
  };
}

/**
 * 初始化游客身份
 */
export async function initGuestAccount(
  guestId?: string
): Promise<{ guestId: string; isNewGuest: boolean }> {
  if (guestId) {
    // 验证 guestId 是否存在
    const user = await findUserById(guestId);
    if (user && user.is_guest === 1) {
      await upsertGuestSession(guestId, {});
      return { guestId, isNewGuest: false };
    }
  }

  // 创建新游客
  const newGuestId = await createGuestAccount();
  await upsertGuestSession(newGuestId, {});
  return { guestId: newGuestId, isNewGuest: true };
}

/**
 * 用户名注册
 */
export async function registerWithUsername(
  username: string,
  password: string
): Promise<{ userId: string; success: boolean; error?: string }> {
  // 验证用户名格式
  if (!username || username.length < 3 || username.length > 20) {
    return { userId: '', success: false, error: '用户名需要3-20个字符' };
  }

  // 验证密码格式
  if (!password || password.length < 6) {
    return { userId: '', success: false, error: '密码至少需要6个字符' };
  }

  // 检查用户名是否已存在
  const existingUser = await query<User[]>(
    'SELECT id FROM users WHERE username = ? LIMIT 1',
    [username]
  );

  if (existingUser.length > 0) {
    return { userId: '', success: false, error: '用户名已被注册' };
  }

  // 哈希密码并创建用户
  const passwordHash = await bcrypt.hash(password, 10);
  const { v4: uuidv4 } = await import('uuid');
  const newUserId = uuidv4();

  await query(
    'INSERT INTO users (id, username, password_hash, is_guest, created_at, updated_at) VALUES (?, ?, ?, 0, NOW(), NOW())',
    [newUserId, username, passwordHash]
  );

  return { userId: newUserId, success: true };
}

/**
 * 用户名登录
 */
export async function loginWithUsername(
  username: string,
  password: string
): Promise<{ userId: string; success: boolean; error?: string }> {
  // 查找用户
  const users = await query<User[]>(
    'SELECT id, username, password_hash, is_guest FROM users WHERE username = ? LIMIT 1',
    [username]
  );

  if (users.length === 0) {
    return { userId: '', success: false, error: '用户名或密码错误' };
  }

  const user = users[0];

  // 验证密码
  if (!user.password_hash) {
    return { userId: '', success: false, error: '用户名或密码错误' };
  }

  const isValidPassword = await bcrypt.compare(password, user.password_hash);

  if (!isValidPassword) {
    return { userId: '', success: false, error: '用户名或密码错误' };
  }

  return { userId: user.id, success: true };
}
