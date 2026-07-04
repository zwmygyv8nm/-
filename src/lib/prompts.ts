export type Prompt = {
  id: string;
  text: string;
  category: string;
};

export const prompts: Prompt[] = [
  // 今日の予定 (8)
  { id: '1', text: '今日の予定を一つだけ話してみよう', category: '今日の予定' },
  { id: '2', text: '今日がんばりたいことを話してみよう', category: '今日の予定' },
  { id: '3', text: '明日の予定を一つ話してみよう', category: '今日の予定' },
  { id: '4', text: '今朝したことを話してみよう', category: '今日の予定' },
  { id: '5', text: '今日の夜にやりたいことを話してみよう', category: '今日の予定' },
  { id: '6', text: '今週の楽しみにしていることを話してみよう', category: '今日の予定' },
  { id: '7', text: '今日の気分に合ったことを何か一つ話してみよう', category: '今日の予定' },
  { id: '8', text: '今日食べたいものを話してみよう', category: '今日の予定' },

  // 今の気分 (6)
  { id: '9', text: '今の気分を一言で話してみよう', category: '今の気分' },
  { id: '10', text: '今ちょっと気になっていることを話してみよう', category: '今の気分' },
  { id: '11', text: '最近ちょっとよかったことを一つ話してみよう', category: '今の気分' },
  { id: '12', text: '今日の天気の感想を話してみよう', category: '今の気分' },
  { id: '13', text: '今日の疲れ具合を話してみよう', category: '今の気分' },
  { id: '14', text: '今ほっとしていることがあれば話してみよう', category: '今の気分' },

  // 好きなもの (8)
  { id: '15', text: '好きな食べ物を一つ話してみよう', category: '好きなもの' },
  { id: '16', text: '好きな飲み物について話してみよう', category: '好きなもの' },
  { id: '17', text: '好きな季節とその理由を話してみよう', category: '好きなもの' },
  { id: '18', text: '好きな時間帯について話してみよう', category: '好きなもの' },
  { id: '19', text: '最近気に入っているものを話してみよう', category: '好きなもの' },
  { id: '20', text: '好きな場所について話してみよう', category: '好きなもの' },
  { id: '21', text: '好きな音楽や曲があれば話してみよう', category: '好きなもの' },
  { id: '22', text: '好きな作品（本・映画・マンガなど）を紹介してみよう', category: '好きなもの' },

  // 出来事 (6)
  { id: '23', text: '最近うれしかったことを話してみよう', category: '出来事' },
  { id: '24', text: '昨日あったことを一つ話してみよう', category: '出来事' },
  { id: '25', text: '最近ちょっとびっくりしたことを話してみよう', category: '出来事' },
  { id: '26', text: '今週やったことを話してみよう', category: '出来事' },
  { id: '27', text: '最近行ったことがある場所を話してみよう', category: '出来事' },
  { id: '28', text: '最近食べておいしかったものを話してみよう', category: '出来事' },

  // 自己紹介 (5)
  { id: '29', text: '自分の好きなことを一つ話してみよう', category: '自己紹介' },
  { id: '30', text: '自己紹介を10秒でやってみよう', category: '自己紹介' },
  { id: '31', text: '自分の得意なことを話してみよう', category: '自己紹介' },
  { id: '32', text: '自分がよくやることを一つ話してみよう', category: '自己紹介' },
  { id: '33', text: '自分のちょっとした習慣を話してみよう', category: '自己紹介' },

  // 説明練習 (6)
  { id: '34', text: '最近気になったことを説明してみよう', category: '説明練習' },
  { id: '35', text: '好きなものをだれかに紹介するつもりで話してみよう', category: '説明練習' },
  { id: '36', text: '今いる場所の様子を話してみよう', category: '説明練習' },
  { id: '37', text: '最近使ったお気に入りのものを説明してみよう', category: '説明練習' },
  { id: '38', text: '今日の朝ごはん（または昼ごはん）を説明してみよう', category: '説明練習' },
  { id: '39', text: '自分のルーティンを一つ説明してみよう', category: '説明練習' },

  // 意見練習 (5)
  { id: '40', text: '好きな季節と苦手な季節を話してみよう', category: '意見練習' },
  { id: '41', text: '朝型と夜型、自分はどっちか話してみよう', category: '意見練習' },
  { id: '42', text: '休日はどんなふうに過ごしたいか話してみよう', category: '意見練習' },
  { id: '43', text: '一人でいるのと大勢でいるの、どっちが好きか話してみよう', category: '意見練習' },
  { id: '44', text: 'ひとつ好きなことを変えるとしたら何か話してみよう', category: '意見練習' },

  // 雑談練習 (5)
  { id: '45', text: '最近の天気について話してみよう', category: '雑談練習' },
  { id: '46', text: '昨日見たものや聞いたものを話してみよう', category: '雑談練習' },
  { id: '47', text: '最近笑ったこと・クスッとしたことを話してみよう', category: '雑談練習' },
  { id: '48', text: '今日の気温やお天気の感想を話してみよう', category: '雑談練習' },
  { id: '49', text: '今すぐ飲みたい飲み物を話してみよう', category: '雑談練習' },

  // 発表ウォームアップ (5)
  { id: '50', text: '自分の名前と一言だけ話してみよう', category: '発表ウォームアップ' },
  { id: '51', text: '今日のテーマを一文で言ってみよう', category: '発表ウォームアップ' },
  { id: '52', text: '「えー」「あの」なしで10秒話してみよう', category: '発表ウォームアップ' },
  { id: '53', text: 'ゆっくりはっきり、好きなものを話してみよう', category: '発表ウォームアップ' },
  { id: '54', text: '「今日話したいこと」を一言で言ってみよう', category: '発表ウォームアップ' },

  // やさしい声出し (5)
  { id: '55', text: '「おはようございます」から始めて、今日の気分を話してみよう', category: 'やさしい声出し' },
  { id: '56', text: '声に出して、今日の日付を言ってみよう', category: 'やさしい声出し' },
  { id: '57', text: '好きな言葉や口癖を声に出してみよう', category: 'やさしい声出し' },
  { id: '58', text: '「今日もよろしく」と声に出してみよう', category: 'やさしい声出し' },
  { id: '59', text: '声に出して、自分に一言声をかけてみよう', category: 'やさしい声出し' },
];

export function getTodayPrompt(): Prompt {
  const today = new Date();
  const seed =
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate();
  const index = seed % prompts.length;
  return prompts[index];
}

export function getAllCategories(): string[] {
  return Array.from(new Set(prompts.map((p) => p.category)));
}

export function getPromptsByCategory(category: string): Prompt[] {
  return prompts.filter((p) => p.category === category);
}

export function getRandomPromptByCategory(category: string, excludeId?: string): Prompt {
  const pool = getPromptsByCategory(category).filter((p) => p.id !== excludeId);
  const list = pool.length > 0 ? pool : getPromptsByCategory(category);
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * カテゴリ（null = 全体）から、既読を避けてお題を返す。
 * 未読が尽きた場合は全体からランダム。
 */
export function getSmartPrompt(
  category: string | null,
  doneTexts: string[],
  excludeId?: string
): Prompt {
  const pool = category ? getPromptsByCategory(category) : [...prompts];
  const doneSet = new Set(doneTexts);
  const undone = pool.filter((p) => !doneSet.has(p.text) && p.id !== excludeId);
  const candidates = undone.length > 0 ? undone : pool.filter((p) => p.id !== excludeId);
  const list = candidates.length > 0 ? candidates : pool;
  return list[Math.floor(Math.random() * list.length)];
}

export function findPromptById(id: string): Prompt | undefined {
  return prompts.find((p) => p.id === id);
}

// --- 今日のお題を当日中は固定するための仕組み ---

const TODAY_PROMPT_KEY = 'hanasu_today_prompt';

type TodayPromptLock = {
  date: string; // YYYY-MM-DD
  category: string | null;
  promptId: string;
};

function todayDateStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function loadTodayPromptLock(): TodayPromptLock | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(TODAY_PROMPT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.date !== 'string' || typeof parsed?.promptId !== 'string') return null;
    return {
      date: parsed.date,
      category: typeof parsed.category === 'string' ? parsed.category : null,
      promptId: parsed.promptId,
    };
  } catch {
    return null;
  }
}

function saveTodayPromptLock(category: string | null, promptId: string): void {
  if (typeof window === 'undefined') return;
  const lock: TodayPromptLock = { date: todayDateStr(), category, promptId };
  localStorage.setItem(TODAY_PROMPT_KEY, JSON.stringify(lock));
}

/**
 * 当日中は同じお題を返す。日付が変わった場合・カテゴリが変わった場合・
 * ロックが壊れている場合のみ、新しいお題を選んでロックし直す。
 */
export function getTodayFixedPrompt(category: string | null, doneTexts: string[]): Prompt {
  const lock = loadTodayPromptLock();
  const today = todayDateStr();

  if (lock && lock.date === today && lock.category === category) {
    const found = findPromptById(lock.promptId);
    if (found) return found;
  }

  const prompt = getSmartPrompt(category, doneTexts);
  saveTodayPromptLock(category, prompt.id);
  return prompt;
}

/**
 * 「別のお題にする」用。ユーザーの明示操作でのみ当日のお題を更新する。
 */
export function rerollTodayPrompt(
  category: string | null,
  doneTexts: string[],
  excludeId: string
): Prompt {
  const prompt = getSmartPrompt(category, doneTexts, excludeId);
  saveTodayPromptLock(category, prompt.id);
  return prompt;
}
