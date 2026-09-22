'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogIn, Music, VolumeX, UserPlus } from 'lucide-react';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 初始化音频 - 默认开启
  useEffect(() => {
    audioRef.current = new Audio('/Altar_of_Flowing_Water.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;

    // 默认开启音乐
    audioRef.current.play().catch(() => {});
    setIsMusicPlaying(true);
    localStorage.setItem('musicEnabled', 'true');

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // 检查登录状态
  useEffect(() => {
    const userId = localStorage.getItem('taluo_user_id');
    if (userId && !userId.startsWith('guest')) {
      setIsLoggedIn(true);
    }
  }, []);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
        localStorage.setItem('musicEnabled', 'false');
      } else {
        audioRef.current.play().catch(() => {});
        localStorage.setItem('musicEnabled', 'true');
      }
      setIsMusicPlaying(!isMusicPlaying);
    }
  };

  const handleAuth = async () => {
    if (!username.trim() || !password.trim()) {
      setAuthError('请输入用户名和密码');
      return;
    }

    setIsLoading(true);
    setAuthError('');

    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const json = await res.json();

      if (!json.success) {
        setAuthError(json.error || '操作失败');
        return;
      }

      // 登录成功
      localStorage.setItem('taluo_user_id', json.data.userId);
      setIsLoggedIn(true);
      setShowAuthModal(false);
      setUsername('');
      setPassword('');
      setAuthError('');
    } catch (err) {
      setAuthError('网络错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('taluo_user_id');
  };

  const switchAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
    setAuthError('');
  };

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* 左侧空白（保持对称） */}
          <div className="w-10" />

          {/* 右侧按钮组 */}
          <div className="flex items-center gap-3">
            {/* 音乐开关 */}
            <motion.button
              onClick={toggleMusic}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-full bg-[#12121f]/80 backdrop-blur-sm border border-[#6b4c9a]/30 flex items-center justify-center text-[#9d7cd8] hover:text-[#f0c674] transition-colors"
              title={isMusicPlaying ? '关闭背景音乐' : '开启背景音乐'}
            >
              {isMusicPlaying ? (
                <Music className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </motion.button>

            {/* 登录/用户按钮 */}
            <motion.button
              onClick={() => isLoggedIn ? handleLogout() : setShowAuthModal(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-full bg-[#12121f]/80 backdrop-blur-sm border border-[#6b4c9a]/30 flex items-center justify-center text-[#9d7cd8] hover:text-[#f0c674] transition-colors"
              title={isLoggedIn ? '退出登录' : '登录'}
            >
              {isLoggedIn ? (
                <User className="w-5 h-5" />
              ) : (
                <LogIn className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </div>
      </header>

      {/* 登录/注册弹窗 */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          >
            {/* 背景遮罩 */}
            <div
              className="absolute inset-0 bg-[#0a0a12]/90 backdrop-blur-sm"
              onClick={() => setShowAuthModal(false)}
            />

            {/* 弹窗内容 */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative bg-[#12121f]/95 border border-[#6b4c9a]/30 rounded-2xl p-8 max-w-sm w-full shadow-2xl"
            >
              <h2 className="font-cinzel text-xl text-gradient-gold mb-6 text-center">
                {authMode === 'login' ? '登录账号' : '注册账号'}
              </h2>

              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="用户名"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                    className="w-full bg-[#0a0a12]/80 border border-[#6b4c9a]/30 rounded-xl px-4 py-3 text-[#e8e6f0] placeholder-[#8b889b] focus:outline-none focus:border-[#9d7cd8]/50"
                  />
                </div>

                <div>
                  <input
                    type="password"
                    placeholder="密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                    className="w-full bg-[#0a0a12]/80 border border-[#6b4c9a]/30 rounded-xl px-4 py-3 text-[#e8e6f0] placeholder-[#8b889b] focus:outline-none focus:border-[#9d7cd8]/50"
                  />
                </div>

                {authError && (
                  <p className="text-red-400 text-sm text-center">{authError}</p>
                )}

                <button
                  onClick={handleAuth}
                  disabled={isLoading}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-[#d4a853] via-[#f0c674] to-[#d4a853] bg-[length:200%_100%] animate-shimmer text-[#0a0a12] font-medium hover:shadow-lg hover:shadow-[#d4a853]/20 transition-shadow disabled:opacity-50"
                >
                  {isLoading ? '处理中...' : (authMode === 'login' ? '登录' : '注册')}
                </button>

                {/* 切换登录/注册 */}
                <div className="text-center">
                  {authMode === 'login' ? (
                    <p className="text-[#8b889b] text-sm">
                      还没有账号？
                      <button
                        onClick={switchAuthMode}
                        className="text-[#9d7cd8] hover:text-[#f0c674] ml-1"
                      >
                        立即注册
                      </button>
                    </p>
                  ) : (
                    <p className="text-[#8b889b] text-sm">
                      已有账号？
                      <button
                        onClick={switchAuthMode}
                        className="text-[#9d7cd8] hover:text-[#f0c674] ml-1"
                      >
                        立即登录
                      </button>
                    </p>
                  )}
                </div>
              </div>

              <p className="text-[#8b889b] text-xs text-center mt-4">
                {authMode === 'login' ? '登录后可保存您的占卜记录和记忆' : '注册后即可保存您的占卜记录和记忆'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
