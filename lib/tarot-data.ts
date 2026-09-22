// Tarot Card Types
export interface TarotCard {
  id: string;
  name: string;
  nameCN: string;
  type: 'major' | 'minor';
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles';
  rank?: number | string;
  imagery: string;
  keywords: string[];
  reversedKeywords: string[];
  image?: string; // 图片路径 /images/TAROT/xxx.png
}

export interface CardPosition {
  index: number;
  name: string;
  nameCN: string;
  meaning: string;
}

export interface SpreadDefinition {
  id: string;
  name: string;
  nameCN: string;
  description: string;
  positions: CardPosition[];
  cardCount: number;
}

// Major Arcana (大阿尔卡纳)
export const majorArcana: TarotCard[] = [
  { id: 'major-0', name: 'The Fool', nameCN: '愚者', type: 'major', imagery: '一个年轻的旅人站在悬崖边，手持白色花朵，凝视远方', image: '/images/TAROT/THE FOOL.png', keywords: ['新的开始', '冒险', '纯真', '自由', '可能性'], reversedKeywords: ['冲动', '鲁莽', '天真', '风险', '停滞'] },
  { id: 'major-1', name: 'The Magician', nameCN: '魔术师', type: 'major', imagery: '一人站在祭坛前，上方悬挂金色圣杯、剑、权杖和五芒星，指向天空', image: '/images/TAROT/THE MAGICIAN.png', keywords: ['创造力', '技能', '意志力', 'manifestation', '行动'], reversedKeywords: ['操控', '欺骗', '技能不足', '浪费潜质', '拖延'] },
  { id: 'major-2', name: 'The High Priestess', nameCN: '女祭司', type: 'major', imagery: '一位女子坐在两根柱子之间的白色月桂椅上，手持卷轴', image: '/images/TAROT/THE HIGH PRIESTESS.png', keywords: ['直觉', '神秘', '内省', '智慧', '潜意识'], reversedKeywords: ['隐藏的秘密', '回避', '直觉迟钝', '表面化', '欺骗'] },
  { id: 'major-3', name: 'The Empress', nameCN: '女皇', type: 'major', imagery: '一位坐在靠垫上的女性，周围是成熟的麦田和流水', image: '/images/TAROT/THE EMPRESS.png', keywords: ['丰盛', 'nurturing', '创造力', '自然', '美'], reversedKeywords: ['空虚', '依赖', '创作瓶颈', '忽视', '停滞'] },
  { id: 'major-4', name: 'The Emperor', nameCN: '皇帝', type: 'major', imagery: '一位坐在石王座上的男人，手持权杖和地球', image: '/images/TAROT/THE EMPEROR.png', keywords: ['权威', '结构', '稳定', '领导力', '控制'], reversedKeywords: ['rigid', '专制', '缺乏自律', '僵化', '失去控制'] },
  { id: 'major-5', name: 'The Hierophant', nameCN: '教皇', type: 'major', imagery: '一位穿白袍的宗教领袖坐在双柱之间，向两个信徒伸出右手', image: '/images/TAROT/THE HEIROPHANT.png', keywords: ['传统', '精神指导', '信仰', '道德', '教育'], reversedKeywords: ['叛逆', '新方法', '误导', '教的陷阱', '个人信仰'] },
  { id: 'major-6', name: 'The Lovers', nameCN: '恋人', type: 'major', imagery: '一男一女站在阳光下，天使在他们上方展翅', image: '/images/TAROT/THE LOVERS.png', keywords: ['爱情', '选择', '和谐', '关系', '价值观'], reversedKeywords: ['不和谐', '失衡', '错误选择', '诱惑', '犹豫'] },
  { id: 'major-7', name: 'The Chariot', nameCN: '战车', type: 'major', imagery: '一位武士站在黑白相间的战车上，由黑马和白马牵引', image: '/images/TAROT/THE CHAROIT.png', keywords: ['意志力', '胜利', '控制', '决心', '成功'], reversedKeywords: ['失控', '失败', '缺乏方向', '疲劳', '冲动'] },
  { id: 'major-8', name: 'Strength', nameCN: '力量', type: 'major', imagery: '一位温柔的女性轻轻打开狮子的嘴', image: '/images/TAROT/STRENGTH.png', keywords: ['勇气', '耐心', '慈悲', '内在力量', '韧性'], reversedKeywords: ['self-doubt', '脆弱', '冲动', '残忍', '不耐心'] },
  { id: 'major-9', name: 'The Hermit', nameCN: '隐士', type: 'major', imagery: '一位老人在黑暗中提着灯笼，照亮前方', image: '/images/TAROT/THE HERMIT.png', keywords: ['内省', '孤独', '寻找真相', '灵性', '指引'], reversedKeywords: ['孤立', '孤独感', '迷失', '倒退', '拒绝帮助'] },
  { id: 'major-10', name: 'Wheel of Fortune', nameCN: '命运之轮', type: 'major', imagery: '一个大轮子带有符文符号和字母，四个生物在角落', image: '/images/TAROT/WHEEL OF FORTUNE.png', keywords: ['命运', 'cycles', '转折点', '运气', '改变'], reversedKeywords: ['bad luck', '抗拒改变', '僵局', '挫折', '失去控制'] },
  { id: 'major-11', name: 'Justice', nameCN: '正义', type: 'major', imagery: '一位蒙眼女性手持剑和天平，站在石柱前', image: '/images/TAROT/JUSTICE.png', keywords: ['公平', '正义', 'truth', '法律', '因果'], reversedKeywords: ['不公正', '偏见', '欺骗', '缺乏责任感', '复仇'] },
  { id: 'major-12', name: 'The Hanged Man', nameCN: '倒吊人', type: 'major', imagery: '一个男人倒挂在T形十字架上，表情平静', image: '/images/TAROT/THE HANGED MAN.png', keywords: ['暂停', '牺牲', '新的视角', 'surrender', '等待'], reversedKeywords: ['拖延', '牺牲过度', '牺牲不足', '牺牲错误的事', '停滯'] },
  { id: 'major-13', name: 'Death', nameCN: '死神', type: 'major', imagery: '身穿黑甲的死亡骑士骑在白马上，周围的人纷纷跪倒', image: '/images/TAROT/DEATH.png', keywords: ['结束', '转变', '过渡', '释放', '重生'], reversedKeywords: ['抗拒改变', '停滞', '僵化', '失去生命', '抑郁'] },
  { id: 'major-14', name: 'Temperance', nameCN: '节制', type: 'major', imagery: '一位天使将红色液体从一个杯子倒到另一个杯子', image: '/images/TAROT/TEMPERANCE.png', keywords: ['平衡', 'patience', 'moderation', '和谐', '调整'], reversedKeywords: ['失衡', '过度', 'self-indulgence', '急躁', '浪费'] },
  { id: 'major-15', name: 'The Devil', nameCN: '恶魔', type: 'major', imagery: '一个长着羊角和翅膀的恶魔坐在立方体上，一男一女被锁链拴住', image: '/images/TAROT/THE DEVIL.png', keywords: ['束缚', '物质主义', '阴影面', 'addiction', '依赖'], reversedKeywords: ['释放', '自由', '打破常规', 'reclaim power', '克服'] },
  { id: 'major-16', name: 'The Tower', nameCN: '塔', type: 'major', imagery: '一座塔被闪电击中，人从窗口坠落', image: '/images/TAROT/THE TOWER.png', keywords: ['破坏', 'sudden change', '启示', '混乱', '觉醒'], reversedKeywords: ['抵抗变化', '恐惧改变', '压抑', '拖延必然之事', '内部冲突'] },
  { id: 'major-17', name: 'The Star', nameCN: '星星', type: 'major', imagery: '一位裸女跪在池塘边，将水倒回陆地和水池', image: '/images/TAROT/THE STAR.png', keywords: ['希望', '灵性', 'renewal', 'inspiration', '宁静'], reversedKeywords: ['绝望', '失去信仰', '枯竭', '不安', '分心'] },
  { id: 'major-18', name: 'The Moon', nameCN: '月亮', type: 'major', imagery: '一轮满月照亮一只龙虾从水中爬出，狗和狼在远处嚎叫', image: '/images/TAROT/THE MOON.png', keywords: ['幻觉', '恐惧', '潜意识', '不安', '神秘'], reversedKeywords: ['恐惧', '焦虑', '压抑', 'clarity', '恢复理智'] },
  { id: 'major-19', name: 'The Sun', nameCN: '太阳', type: 'major', imagery: '两个小孩坐在白马上，背后是金色的太阳', image: '/images/TAROT/THE SUN.png', keywords: ['快乐', 'success', '活力', 'joy', '温暖'], reversedKeywords: ['悲伤', '抑郁', '失败', '停滞', '孤独'] },
  { id: 'major-20', name: 'Judgement', nameCN: '审判', type: 'major', imagery: '天使吹号角，死人从棺材中站起来响应', image: '/images/TAROT/JUDGEMENT.png', keywords: ['rebirth', '更新', '赦免', 'reflection', '召唤'], reversedKeywords: ['self-doubt', '否定', '拒绝', '评判他人', '不原谅'] },
  { id: 'major-21', name: 'The World', nameCN: '世界', type: 'major', imagery: '一个女人在圆形花环中舞蹈，四角有天使、牛、鹰和狮子', image: '/images/TAROT/THE WORLD.png', keywords: ['完成', '成就', 'integration', 'wholeness', '圆满'], reversedKeywords: ['不完整', '停滞', '失败', '缺失', '空虚'] },
];

// Minor Arcana - Wands (权杖)
export const wandsArcana: TarotCard[] = [
  { id: 'minor-wands-ace', name: 'Ace of Wands', nameCN: '权杖 Ace', type: 'minor', suit: 'wands', rank: 'Ace', imagery: '一只手从云中伸出，持有一根金色权杖，顶端发出火焰', image: '/images/TAROT/ACE OF WANDS.png', keywords: ['创意', '灵感', 'new venture', '热情', 'growth'], reversedKeywords: ['延迟', '缺乏灵感', '犹豫', '浪费潜力', '消极'] },
  { id: 'minor-wands-2', name: 'Two of Wands', nameCN: '权杖二', type: 'minor', suit: 'wands', rank: 2, imagery: '一个人站在阳台上俯瞰城市，手中握着权杖', image: '/images/TAROT/TWO OF WANDS.png', keywords: ['planning', '决策', 'discovery', 'vision', '选择'], reversedKeywords: ['fear of change', 'lack of planning', '犹豫', '停滞', '错失机会'] },
  { id: 'minor-wands-3', name: 'Three of Wands', nameCN: '权杖三', type: 'minor', suit: 'wands', rank: 3, imagery: '一个人站在悬崖边，看着三根权杖插在地上，远方有船', image: '/images/TAROT/THREE OF WANDS.png', keywords: ['展望', '等待', '探索', 'foresight', '可能性'], reversedKeywords: ['阻碍', '等待挫折', 'lack of vision', '延误', '失去信心'] },
  { id: 'minor-wands-4', name: 'Four of Wands', nameCN: '权杖四', type: 'minor', suit: 'wands', rank: 4, imagery: '两根装饰有花朵的棍子形成拱门，下面有人庆祝', image: '/images/TAROT/FOUR OF WANDS.png', keywords: ['celebration', 'harmony', 'marriage', 'homecoming', '团聚'], reversedKeywords: ['冲突', '缺乏支持', '不安定', 'home discord', '拖延庆祝'] },
  { id: 'minor-wands-5', name: 'Five of Wands', nameCN: '权杖五', type: 'minor', suit: 'wands', rank: 5, imagery: '五个人挥舞着权杖相互争斗', image: '/images/TAROT/FIVE OF WANDS.png', keywords: ['竞争', '冲突', '多样性', 'disagreements', '挑战'], reversedKeywords: ['避免冲突', '和解', '输掉战斗', '合作', '解决分歧'] },
  { id: 'minor-wands-6', name: 'Six of Wands', nameCN: '权杖六', type: 'minor', suit: 'wands', rank: 6, imagery: '一个胜利者骑着白马，头戴月桂花冠，群人欢呼', image: '/images/TAROT/SIX OF WANDS.png', keywords: ['胜利', 'success', 'recognition', 'praise', '成就'], reversedKeywords: ['失败', '失去认可', '傲慢', 'ego', '争议'] },
  { id: 'minor-wands-7', name: 'Seven of Wands', nameCN: '权杖七', type: 'minor', suit: 'wands', rank: 7, imagery: '一个人站在城堡顶的梯子上，用权杖击退攻击者', image: '/images/TAROT/SEVEN OF WANDS.png', keywords: ['挑战', '竞争', '坚持', 'defence', '勇气'], reversedKeywords: ['overwhelmed', 'exhausted', '放弃', '被征服', '劣势'] },
  { id: 'minor-wands-8', name: 'Eight of Wands', nameCN: '权杖八', type: 'minor', suit: 'wands', rank: 8, imagery: '八根权杖快速飞过天空，越过风景', image: '/images/TAROT/EIGHT OF WANDS.png', keywords: ['快速行动', 'progress', '变化', 'movement', '活力'], reversedKeywords: ['延迟', '挫折', '失去动力', '慢下来', '等待'] },
  { id: 'minor-wands-9', name: 'Nine of Wands', nameCN: '权杖九', type: 'minor', suit: 'wands', rank: 9, imagery: '一个疲惫的战士靠在他的权杖上，身上缠着绷带，周围有八根权杖', image: '/images/TAROT/NINE OF WANDS.png', keywords: ['坚韧', '毅力', 'endurance', '最后一个挑战', '坚持'], reversedKeywords: ['exhaustion', 'paranoia', '失败', '疲劳', '放弃'] },
  { id: 'minor-wands-10', name: 'Ten of Wands', nameCN: '权杖十', type: 'minor', suit: 'wands', rank: 10, imagery: '一个人艰难地扛着十根沉重的权杖走近家门', image: '/images/TAROT/TEN OF WANDS.png', keywords: ['负担', '压力', '努力', 'responsibility', 'overload'], reversedKeywords: ['overload', 'burnout', '压力过大', '无法委托', '轻松'] },
  { id: 'minor-wands-page', name: 'Page of Wands', nameCN: '权杖侍卫', type: 'minor', suit: 'wands', rank: 'Page', imagery: '一个年轻人在荒野中手持权杖，凝视着飞蝶', image: '/images/TAROT/PAGE OF WANDS.png', keywords: ['探索', 'discovery', '自由', 'cheerfulness', 'adventure'], reversedKeywords: ['犹豫', 'lack of direction', '延迟', '不安全', 'self-discovery'] },
  { id: 'minor-wands-knight', name: 'Knight of Wands', nameCN: '权杖骑士', type: 'minor', suit: 'wands', rank: 'Knight', imagery: '一个骑士骑着黑马，手持燃烧的权杖，斗篷飘扬', image: '/images/TAROT/NIGHT OF WANDS.png', keywords: ['energy', 'passion', 'adventure', '勇敢', '冲动'], reversedKeywords: ['延迟', '挫折', 'careless', 'recklessness', '失去耐心'] },
  { id: 'minor-wands-queen', name: 'Queen of Wands', nameCN: '权杖皇后', type: 'minor', suit: 'wands', rank: 'Queen', imagery: '一位自信的女性坐在宝座上，手持向日葵和权杖', image: '/images/TAROT/QUEEN OF WANDS.png', keywords: ['confident', 'warm', 'passionate', 'independent', '自然'], reversedKeywords: ['self-centred', 'jealous', 'insecure', 'clingy', '支配'] },
  { id: 'minor-wands-king', name: 'King of Wands', nameCN: '权杖国王', type: 'minor', suit: 'wands', rank: 'King', imagery: '一个男人坐在宝座上，手持权杖，神情威严', image: '/images/TAROT/KING OF WANDS.png', keywords: ['领导力', 'vision', 'enterprise', 'honour', 'determination'], reversedKeywords: ['tyranny', 'harsh', 'impulsive', 'dominating', 'unrealistics'] },
];

// Minor Arcana - Cups (圣杯)
export const cupsArcana: TarotCard[] = [
  { id: 'minor-cups-ace', name: 'Ace of Cups', nameCN: '圣杯 Ace', type: 'minor', suit: 'cups', rank: 'Ace', imagery: '一只手中从云中伸出，持有一个圣杯，鸽子将水倒出', image: '/images/TAROT/ACE OF CUPS.png', keywords: ['love', 'compassion', '情感', 'creativity', '灵魂'], reversedKeywords: ['emptiness', 'emotional vacancy', 'repressed feelings', 'numbness', 'self-love'] },
  { id: 'minor-cups-2', name: 'Two of Cups', nameCN: '圣杯二', type: 'minor', suit: 'cups', rank: 2, imagery: '一男一女互相握手，两个圣杯之间有flows', image: '/images/TAROT/TWO OF CUPS.png', keywords: ['partnership', 'unity', 'love', 'harmony', 'attraction'], reversedKeywords: ['imbalance', 'tension', 'broken communication', '分离', 'attraction'] },
  { id: 'minor-cups-3', name: 'Three of Cups', nameCN: '圣杯三', type: 'minor', suit: 'cups', rank: 3, imagery: '三位女子手牵手站成圆形，举杯庆祝', image: '/images/TAROT/THREE OF CUPS.png', keywords: ['friendship', 'community', 'celebration', 'creativity', 'collaboration'], reversedKeywords: ['gossip', 'miscommunication', 'third party', 'isolation', 'overkill'] },
  { id: 'minor-cups-4', name: 'Four of Cups', nameCN: '圣杯四', type: 'minor', suit: 'cups', rank: 4, imagery: '一个年轻人坐在树下，三个杯子在他面前，第四个被伸出手的人提供', image: '/images/TAROT/FOUR OF CUPS.png', keywords: ['apathy', 'contemplation', 'discernment', 'depression', 'dissatisfaction'], reversedKeywords: ['motivation', 'acceptance', 'inspiration', 'awareness', 'renewed interest'] },
  { id: 'minor-cups-5', name: 'Five of Cups', nameCN: '圣杯五', type: 'minor', suit: 'cups', rank: 5, imagery: '一个人站在倒下和倒置的杯子前，远处有阳光', image: '/images/TAROT/FIVE OF CUPS.png', keywords: ['loss', 'grief', 'regret', 'disappointment', 'sorrow'], reversedKeywords: ['acceptance', 'moving on', 'finding peace', 'recovery', 'hope'] },
  { id: 'minor-cups-6', name: 'Six of Cups', nameCN: '圣杯六', type: 'minor', suit: 'cups', rank: 6, imagery: '两个孩子交换金色圣杯，背景是花园', image: '/images/TAROT/SIX OF CUPS.png', keywords: ['nostalgia', 'memories', 'innocence', 'joy', 'reconciliation'], reversedKeywords: ['stuck in past', 'naivety', 'unrealistic', 'forgiveness', 'moving forward'] },
  { id: 'minor-cups-7', name: 'Seven of Cups', nameCN: '圣杯七', type: 'minor', suit: 'cups', rank: 7, imagery: '一个人站在雾中，面前有七个漂浮的杯子，各有不同内容', image: '/images/TAROT/SEVEN OF CUPS.png', keywords: ['choices', 'fantasy', 'illusion', 'wishful thinking', 'opportunities'], reversedKeywords: ['clarity', 'focus', 'real goals', 'determination', 'priorities'] },
  { id: 'minor-cups-8', name: 'Eight of Cups', nameCN: '圣杯八', type: 'minor', suit: 'cups', rank: 8, imagery: '一个人拄着拐杖离开八个叠起的杯子，朝着山脉走去', image: '/images/TAROT/EIGHT OF CUPS.png', keywords: ['walking away', 'leaving behind', 'disappointment', 'searching for truth', 'withdrawal'], reversedKeywords: ['fear of change', 'stagnation', 'avoidance', 'staying', 'commitment'] },
  { id: 'minor-cups-9', name: 'Nine of Cups', nameCN: '圣杯九', type: 'minor', suit: 'cups', rank: 9, imagery: '一个男人像商店一样坐在那里，周围是九个圣杯', image: '/images/TAROT/NINE OF CUPS.png', keywords: ['contentment', 'satisfaction', 'gratitude', 'wish fulfilled', 'happiness'], reversedKeywords: ['dissatisfaction', 'greed', 'materialism', 'discontent', 'indulgence'] },
  { id: 'minor-cups-10', name: 'Ten of Cups', nameCN: '圣杯十', type: 'minor', suit: 'cups', rank: 10, imagery: '一对夫妇和两个孩子手牵手在彩虹下，两个杯子溢出', image: '/images/TAROT/TEN OF CUPS.png', keywords: ['happiness', 'family', 'homecoming', 'emotional fulfillment', 'harmony'], reversedKeywords: ['broken home', 'domestic violence', 'disharmony', 'unhappiness', 'frustration'] },
  { id: 'minor-cups-page', name: 'Page of Cups', nameCN: '圣杯侍卫', type: 'minor', suit: 'cups', rank: 'Page', imagery: '一个年轻人站在海边，手持圣杯，凝视水面，一只鱼跳出来', image: '/images/TAROT/PAGE OF CUPS.png', keywords: ['creative opportunities', 'intuitive messages', 'curiosity', 'possibility', 'curiosity'], reversedKeywords: ['emotional immaturity', 'creative blocks', 'escape', 'moodiness', 'disappointment'] },
  { id: 'minor-cups-knight', name: 'Knight of Cups', nameCN: '圣杯骑士', type: 'minor', suit: 'cups', rank: 'Knight', imagery: '一个骑士骑着白马，手持圣杯，优雅地移动', image: '/images/TAROT/KNIGHT OF CUPS.png', keywords: ['romance', 'charm', 'imagination', 'following the heart', 'idealism'], reversedKeywords: ['moodiness', 'unrealistic', 'jealousy', 'conflict', 'impulsiveness'] },
  { id: 'minor-cups-queen', name: 'Queen of Cups', nameCN: '圣杯皇后', type: 'minor', suit: 'cups', rank: 'Queen', imagery: '一位温柔的女性坐在海边的宝座上，手持圣杯', image: '/images/TAROT/QUEEN OF CUPS.png', keywords: ['compassion', 'empathy', 'emotional security', 'nurturing', 'intuition'], reversedKeywords: ['emotional instability', 'martyrdom', 'codependency', 'overwhelming', 'insecurity'] },
  { id: 'minor-cups-king', name: 'King of Cups', nameCN: '圣杯国王', type: 'minor', suit: 'cups', rank: 'King', imagery: '一个坐在海边的宝座上的男人，手持权和剑', image: '/images/TAROT/KING OF CUPS.png', keywords: ['emotional balance', 'diplomacy', 'compassion', 'calm', 'maturity'], reversedKeywords: ['emotional manipulation', 'moodiness', 'volatility', 'impulsiveness', 'coldness'] },
];

// Minor Arcana - Swords (宝剑)
export const swordsArcana: TarotCard[] = [
  { id: 'minor-swords-ace', name: 'Ace of Swords', nameCN: '宝剑 Ace', type: 'minor', suit: 'swords', rank: 'Ace', imagery: '一只手从云中伸出，持有一把向上的剑，顶部有金色王冠', image: '/images/TAROT/ACE OF SWORDS.png', keywords: ['breakthrough', 'clarity', 'truth', 'mental clarity', 'new ideas'], reversedKeywords: ['confusion', 'misinformation', 'chaos', 'overload', 'brutality'] },
  { id: 'minor-swords-2', name: 'Two of Swords', nameCN: '宝剑二', type: 'minor', suit: 'swords', rank: 2, imagery: '一个女人坐在石凳上，蒙眼，双手交叉持剑在天平上', image: '/images/TAROT/TWO OF SWORDS.png', keywords: ['difficult choice', 'stalemate', 'blocked emotions', 'avoidance', 'blocked'], reversedKeywords: ['indecision', 'confusion', 'avoidance', 'procrastination', 'lies'] },
  { id: 'minor-swords-3', name: 'Three of Swords', nameCN: '宝剑三', type: 'minor', suit: 'swords', rank: 3, imagery: '一颗心被三把剑刺穿，心后是下雨的天空', image: '/images/TAROT/THREE OF SWORDS.png', keywords: ['heartbreak', 'emotional pain', 'sorrow', 'grief', 'betrayal'], reversedKeywords: ['recovery', 'forgiveness', 'releasing pain', 'moving on', 'hope'] },
  { id: 'minor-swords-4', name: 'Four of Swords', nameCN: '宝剑四', type: 'minor', suit: 'swords', rank: 4, imagery: '一个人躺在教会长凳下，剑挂在头顶的墙上', image: '/images/TAROT/FOUR OF SWORDS.png', keywords: ['rest', 'relaxation', 'meditation', 'contemplation', 'recuperation'], reversedKeywords: ['restlessness', 'burnout', 'exhaustion', 'stress', 'overwork'] },
  { id: 'minor-swords-5', name: 'Five of Swords', nameCN: '宝剑五', type: 'minor', suit: 'swords', rank: 5, imagery: '一个人拿着两把剑离开，而另外两个人被打败躺在地上', image: '/images/TAROT/FIVE OF SWORDS.png', keywords: ['conflict', 'defeat', 'winning at all costs', 'betrayal', 'hostility'], reversedKeywords: ['reconciliation', 'making peace', 'openness', 'conflict avoidance', 'forgiveness'] },
  { id: 'minor-swords-6', name: 'Six of Swords', nameCN: '宝剑六', type: 'minor', suit: 'swords', rank: 6, imagery: '一个人在船上持剑渡河，其他人坐在船里，水面平静', image: '/images/TAROT/SIX OF SWORDS.png', keywords: ['transition', 'leaving behind', 'moving forward', 'recovery', 'departure'], reversedKeywords: ['stagnation', 'rough waters', 'struggling', 'unwilling to move on', 'stuck'] },
  { id: 'minor-swords-7', name: 'Seven of Swords', nameCN: '宝剑七', type: 'minor', suit: 'swords', rank: 7, imagery: '一个男人踮起脚尖从营地偷走五把剑，被其他两人忽视', image: '/images/TAROT/SEVEN OF SWORDS.png', keywords: ['strategy', 'cunning', 'stealth', 'deception', 'getting away with something'], reversedKeywords: ['confession', 'honesty', 'exposure', 'self-deception', 'truth'] },
  { id: 'minor-swords-8', name: 'Eight of Swords', nameCN: '宝剑八', type: 'minor', suit: 'swords', rank: 8, imagery: '一个女人被绑在八把剑围成的笼子里，蒙着眼', image: '/images/TAROT/EIGHT OF SWORDS.png', keywords: ['imprisonment', 'entrapment', 'self-victimization', 'helplessness', 'restriction'], reversedKeywords: ['freedom', 'release', 'new perspective', 'taking control', 'empowerment'] },
  { id: 'minor-swords-9', name: 'Nine of Swords', nameCN: '宝剑九', type: 'minor', suit: 'swords', rank: 9, imagery: '一个女人坐在床上，双手捂脸，周围有九把剑挂墙上', image: '/images/TAROT/NINE OF SWORDS.png', keywords: ['anxiety', 'worry', 'fear', 'depression', 'nightmares'], reversedKeywords: ['hope', 'recovery', 'reaching out', 'facing fears', 'clarity'] },
  { id: 'minor-swords-10', name: 'Ten of Swords', nameCN: '宝剑十', type: 'minor', suit: 'swords', rank: 10, imagery: '一个人面朝下躺在地上，十把剑刺穿他的后背', image: '/images/TAROT/TEN OF SWORDS.png', keywords: ['endings', 'betrayal', 'loss', 'pain', 'crisis'], reversedKeywords: ['recovery', 'regeneration', 'resistance', 'fighting back', 'breakthrough'] },
  { id: 'minor-swords-page', name: 'Page of Swords', nameCN: '宝剑侍卫', type: 'minor', suit: 'swords', rank: 'Page', imagery: '一个年轻人站在山巅，手持剑指向天空，乌鸦盘旋', image: '/images/TAROT/PAGE OF SWORDS.png', keywords: ['curiosity', 'new ideas', 'thirst for knowledge', 'communication', 'vigilance'], reversedKeywords: ['scattering thoughts', 'deception', 'spreading rumors', 'gossiper', '精力分散'] },
  { id: 'minor-swords-knight', name: 'Knight of Swords', nameCN: '宝剑骑士', type: 'minor', suit: 'swords', rank: 'Knight', imagery: '一个骑士骑着白马高速冲刺，手持剑，目光坚定', image: '/images/TAROT/NIGHT OF SWORDS.png', keywords: ['ambition', 'action', 'drive', 'fast thinking', 'determination'], reversedKeywords: ['recklessness', 'haste', 'ruthless', 'impetuous', 'arrogance'] },
  { id: 'minor-swords-queen', name: 'Queen of Swords', nameCN: '宝剑皇后', type: 'minor', suit: 'swords', rank: 'Queen', imagery: '一位严肃的女性坐在云端宝座上，手持剑，眼神犀利', image: '/images/TAROT/QUEEN OF SWORDS.png', keywords: ['independent', 'truthful', 'perceptive', 'clear boundaries', 'direct'], reversedKeywords: ['overly critical', 'malicious', 'cold-hearted', 'cruel', 'bitterness'] },
  { id: 'minor-swords-king', name: 'King of Swords', nameCN: '宝剑国王', type: 'minor', suit: 'swords', rank: 'King', imagery: '一个男人坐在宝座上，手持剑和天平，神情严肃', image: '/images/TAROT/KING OF SWORDS.png', keywords: ['authority', 'truth', 'clear thinking', 'intellectual power', 'fairness'], reversedKeywords: ['manipulation', 'tyranny', 'cruelty', 'abuse', 'coldness'] },
];

// Minor Arcana - Pentacles (星币)
export const pentaclesArcana: TarotCard[] = [
  { id: 'minor-pentacles-ace', name: 'Ace of Pentacles', nameCN: '星币 Ace', type: 'minor', suit: 'pentacles', rank: 'Ace', imagery: '一只手从云中伸出，持有一枚金色星币，花园在背景中', image: '/images/TAROT/ACE OF PENTACLES.png', keywords: ['new financial opportunity', 'manifestation', 'prosperity', 'abundance', 'security'], reversedKeywords: ['missed opportunity', 'poor financial planning', 'greed', 'loss', 'instability'] },
  { id: 'minor-pentacles-2', name: 'Two of Pentacles', nameCN: '星币二', type: 'minor', suit: 'pentacles', rank: 2, imagery: '一个小丑在舞台上舞蹈，同时抛接两枚星币，马戏团在背景', image: '/images/TAROT/TWO OF PENTACLES.png', keywords: ['balance', 'adaptability', 'time management', 'prioritization', 'flexibility'], reversedKeywords: ['imbalance', 'disorganization', 'over-committed', 'overwhelmed', 'chaos'] },
  { id: 'minor-pentacles-3', name: 'Three of Pentacles', nameCN: '星币三', type: 'minor', suit: 'pentacles', rank: 3, imagery: '一个石匠在修建大教堂，两个建筑师在一旁观看', image: '/images/TAROT/THREE OF PENTACLES.png', keywords: ['teamwork', 'collaboration', 'learning', 'implementation', 'mastery'], reversedKeywords: ['lack of teamwork', 'poor quality', 'working alone', 'obstacles', 'delays'] },
  { id: 'minor-pentacles-4', name: 'Four of Pentacles', nameCN: '星币四', type: 'minor', suit: 'pentacles', rank: 4, imagery: '一个有钱人坐在街上紧紧抓住四枚星币，其他人试图向他乞求', image: '/images/TAROT/FOUR OF PENTACLES.png', keywords: ['saving', 'security', 'conservation', 'control', 'wealth'], reversedKeywords: ['greed', 'materialism', 'letting go', 'overspending', 'poverty'] },
  { id: 'minor-pentacles-5', name: 'Five of Pentacles', nameCN: '星币五', type: 'minor', suit: 'pentacles', rank: 5, imagery: '两个穿着破旧的人在暴风雪中走过教堂窗户的灯光', image: '/images/TAROT/FIVE OF PENTACLES.png', keywords: ['financial loss', 'poverty', 'isolation', 'worry', 'hardship'], reversedKeywords: ['recovery', 'improvement', 'spiritual poverty', 'after difficulties', 'finding help'] },
  { id: 'minor-pentacles-6', name: 'Six of Pentacles', nameCN: '星币六', type: 'minor', suit: 'pentacles', rank: 6, imagery: '一个有钱人向乞丐分发星币，天平在他手中平衡', image: '/images/TAROT/SIX OF PENTACLES.png', keywords: ['giving', 'receiving', 'sharing', 'wealth', 'generosity'], reversedKeywords: ['debt', 'strings attached', 'inequity', 'strings', 'selfishness'] },
  { id: 'minor-pentacles-7', name: 'Seven of Pentacles', nameCN: '星币七', type: 'minor', suit: 'pentacles', rank: 7, imagery: '一个农夫靠在铁锹上，看着他辛勤劳动种植的农作物', image: '/images/TAROT/SEVEN OF PENTACLES.png', keywords: ['patience', 'perseverance', 'investment', 'long-term view', 'rewards'], reversedKeywords: ['impatience', 'poor returns', 'wasted effort', 'lack of long-term vision', 'frustration'] },
  { id: 'minor-pentacles-8', name: 'Eight of Pentacles', nameCN: '星币八', type: 'minor', suit: 'pentacles', rank: 8, imagery: '一个工匠在工作坊里雕刻星币，全神贯注于工作', image: '/images/TAROT/EIGHT OF PENTACLES.png', keywords: ['apprenticeship', 'repetitive tasks', 'mastery', 'skill development', 'dedication'], reversedKeywords: ['lack of focus', 'perfectionism', 'no ambition', 'uninspired', 'shortcuts'] },
  { id: 'minor-pentacles-9', name: 'Nine of Pentacles', nameCN: '星币九', type: 'minor', suit: 'pentacles', rank: 9, imagery: '一位优雅的女性在花园中散步，周围有九枚星币，鹦鹉停在她手上', image: '/images/TAROT/NINE OF PENTACLES.png', keywords: ['abundance', 'luxury', 'self-sufficiency', 'financial independence', 'enjoyment'], reversedKeywords: ['over-spending', 'greed', 'living beyond means', 'hustle', 'dependency'] },
  { id: 'minor-pentacles-10', name: 'Ten of Pentacles', nameCN: '星币十', type: 'minor', suit: 'pentacles', rank: 10, imagery: '一个富有的家庭坐在家中，周围有十枚星币，一只狗在门口', image: '/images/TAROT/TEN OF PENTACLES.png', keywords: ['wealth', 'inheritance', 'family', 'establishment', 'legacy'], reversedKeywords: ['financial failure', 'loss', 'family conflict', 'inheritance dispute', 'fleeting success'] },
  { id: 'minor-pentacles-page', name: 'Page of Pentacles', nameCN: '星币侍卫', type: 'minor', suit: 'pentacles', rank: 'Page', imagery: '一个年轻人在乡村手持星币，凝视着远方的城堡', image: '/images/TAROT/PAGE OF PENTACLES.png', keywords: ['manifestation', 'financial opportunity', 'skill development', 'ambition', 'practicality'], reversedKeywords: ['lack of progress', 'procrastination', 'Unrealistic expectations', 'get-rich-quick', 'immaturity'] },
  { id: 'minor-pentacles-knight', name: 'Knight of Pentacles', nameCN: '星币骑士', type: 'minor', suit: 'pentacles', rank: 'Knight', imagery: '一个骑士骑着稳稳的黑马，手持星币，庄严地移动', image: '/images/TAROT/KNIGHT OF PENTACLES.png', keywords: ['efficiency', 'routine', 'conservatism', 'hard work', 'responsibility'], reversedKeywords: ['boredom', 'feeling stuck', 'laziness', 'apathy', 'procrastination'] },
  { id: 'minor-pentacles-queen', name: 'Queen of Pentacles', nameCN: '星币皇后', type: 'minor', suit: 'pentacles', rank: 'Queen', imagery: '一位丰盛的女性坐在花园中的宝座上，手持星币', image: '/images/TAROT/QUEEN OF PENTACLES.png', keywords: ['nurturing', 'practical', 'abundant', 'secure', 'grounded'], reversedKeywords: ['financial insecurity', 'self-neglect', 'jealousy', 'smothering', 'materialistic'] },
  { id: 'minor-pentacles-king', name: 'King of Pentacles', nameCN: '星币国王', type: 'minor', suit: 'pentacles', rank: 'King', imagery: '一个坐在宝座上的男人，手持星币和锤子，神情满足', image: '/images/TAROT/KING OF PENTACLES.png', keywords: ['wealth', 'business', 'leadership', 'security', 'discipline'], reversedKeywords: ['greed', 'materialism', 'corruption', 'stubbornness', 'avarice'] },
];

// Combine all cards
export const allTarotCards: TarotCard[] = [
  ...majorArcana,
  ...wandsArcana,
  ...cupsArcana,
  ...swordsArcana,
  ...pentaclesArcana,
];

// Spread Definitions (牌阵定义)
export const spreads: SpreadDefinition[] = [
  {
    id: 'single',
    name: 'Single Card',
    nameCN: '单牌解读',
    description: '抽取一张牌，获得当下最需要的指引',
    cardCount: 1,
    positions: [
      { index: 0, name: 'Present', nameCN: '当下', meaning: '反映你目前的状况或需要注意的事情' },
    ],
  },
  {
    id: 'three',
    name: 'Three Card Spread',
    nameCN: '三牌阵',
    description: '过去 - 现在 - 未来：探索时间线上的变化',
    cardCount: 3,
    positions: [
      { index: 0, name: 'Past', nameCN: '过去', meaning: '影响当下的过往经历或行为模式' },
      { index: 1, name: 'Present', nameCN: '现在', meaning: '你目前正在经历的状态或挑战' },
      { index: 2, name: 'Future', nameCN: '未来', meaning: '如果保持现状，可能的发展方向' },
    ],
  },
  {
    id: 'celtic',
    name: 'Celtic Cross',
    nameCN: '凯尔特十字',
    description: '深入全面的10牌阵，揭示复杂局势的各个层面',
    cardCount: 10,
    positions: [
      { index: 0, name: 'Present', nameCN: '现状', meaning: '你目前真正的处境' },
      { index: 1, name: 'Challenge', nameCN: '挑战', meaning: '面前的障碍或需要面对的课题' },
      { index: 2, name: 'Foundation', nameCN: '基础', meaning: '过往经历对现状的影响' },
      { index: 3, name: 'Past', nameCN: '过去', meaning: '最近发生的事件' },
      { index: 4, name: 'Crown', nameCN: '理想', meaning: '你内心的渴望或理想' },
      { index: 5, name: 'Future', nameCN: '未来', meaning: '短期内可能的发展' },
      { index: 6, name: 'Near', nameCN: '近景', meaning: '你对他的影响或周围环境' },
      { index: 7, name: 'Self', nameCN: '自我', meaning: '你的内心态度或隐藏因素' },
      { index: 8, name: 'Hope', nameCN: '希望', meaning: '你对结果的期望或可能性' },
      { index: 9, name: 'Outcome', nameCN: '结果', meaning: '最终的可能结果' },
    ],
  },
  {
    id: 'horseshoe',
    name: 'Horseshoe Spread',
    nameCN: '马蹄铁阵',
    description: '7牌阵，展示事件发展的各个阶段',
    cardCount: 7,
    positions: [
      { index: 0, name: 'Past', nameCN: '起始', meaning: '事情的起源或背景' },
      { index: 1, name: 'Present 1', nameCN: '现状1', meaning: '当前状况的第一层面' },
      { index: 2, name: 'Present 2', nameCN: '现状2', meaning: '当前状况的第二层面' },
      { index: 3, name: 'Challenge', nameCN: '挑战', meaning: '需要克服的障碍' },
      { index: 4, name: 'Past Influence', nameCN: '影响', meaning: '来自过去的影响' },
      { index: 5, name: 'Future 1', nameCN: '可能1', meaning: '可能的第一个发展方向' },
      { index: 6, name: 'Future 2', nameCN: '可能2', meaning: '可能的第二个发展方向' },
    ],
  },
];

// Helper functions
export function getCardById(id: string): TarotCard | undefined {
  return allTarotCards.find(card => card.id === id);
}

export function getSpreadById(id: string): SpreadDefinition | undefined {
  return spreads.find(spread => spread.id === id);
}

export function shuffleCards(cards: TarotCard[]): TarotCard[] {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function drawCards(count: number, excludeIds: string[] = []): TarotCard[] {
  const available = allTarotCards.filter(card => !excludeIds.includes(card.id));
  return shuffleCards(available).slice(0, count);
}
