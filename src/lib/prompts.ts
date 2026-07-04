export type Prompt = {
  id: string;
  text: string;
  category: string;
  // 話し出しサポート：そのまま読んでもOKな、短い話し出し例（任意）
  starter?: string;
};

export const prompts: Prompt[] = [
  // 今日の予定 (8)
  { id: '1', text: '今日の予定を一つだけ話してみよう', category: '今日の予定', starter: '今日は〇〇をします。まず〇〇をして、そのあと〇〇をする予定です。' },
  { id: '2', text: '今日がんばりたいことを話してみよう', category: '今日の予定', starter: '今日がんばりたいのは〇〇です。少しずつでいいので進めたいです。' },
  { id: '3', text: '明日の予定を一つ話してみよう', category: '今日の予定', starter: '明日は〇〇をする予定です。楽しみにしています。' },
  { id: '4', text: '今朝したことを話してみよう', category: '今日の予定', starter: '今朝は〇〇をしました。いつも通りの朝でした。' },
  { id: '5', text: '今日の夜にやりたいことを話してみよう', category: '今日の予定', starter: '今夜は〇〇をしたいです。ゆっくり過ごせたらいいなと思います。' },
  { id: '6', text: '今週の楽しみにしていることを話してみよう', category: '今日の予定', starter: '今週は〇〇が楽しみです。それまで少し頑張ろうと思います。' },
  { id: '7', text: '今日の気分に合ったことを何か一つ話してみよう', category: '今日の予定', starter: '今日は〇〇な気分なので、〇〇をしようと思います。' },
  { id: '8', text: '今日食べたいものを話してみよう', category: '今日の予定', starter: '今日は〇〇が食べたいです。理由は特にないですが、なんとなくです。' },

  // 今の気分 (6)
  { id: '9', text: '今の気分を一言で話してみよう', category: '今の気分', starter: '今の気分は〇〇です。理由は、〇〇だからです。' },
  { id: '10', text: '今ちょっと気になっていることを話してみよう', category: '今の気分', starter: '今、〇〇が少し気になっています。大したことではないんですが。' },
  { id: '11', text: '最近ちょっとよかったことを一つ話してみよう', category: '今の気分', starter: '最近、〇〇があって少しよかったです。' },
  { id: '12', text: '今日の天気の感想を話してみよう', category: '今の気分', starter: '今日の天気は〇〇です。〇〇な感じがします。' },
  { id: '13', text: '今日の疲れ具合を話してみよう', category: '今の気分', starter: '今日は〇〇くらい疲れています。無理せず過ごしたいです。' },
  { id: '14', text: '今ほっとしていることがあれば話してみよう', category: '今の気分', starter: '今、〇〇のことでほっとしています。' },

  // 好きなもの (8)
  { id: '15', text: '好きな食べ物を一つ話してみよう', category: '好きなもの', starter: '私が好きなのは〇〇です。特に〇〇なところが好きです。' },
  { id: '16', text: '好きな飲み物について話してみよう', category: '好きなもの', starter: '好きな飲み物は〇〇です。〇〇なときによく飲みます。' },
  { id: '17', text: '好きな季節とその理由を話してみよう', category: '好きなもの', starter: '好きな季節は〇〇です。理由は〇〇だからです。' },
  { id: '18', text: '好きな時間帯について話してみよう', category: '好きなもの', starter: '好きな時間帯は〇〇です。〇〇な感じがして落ち着きます。' },
  { id: '19', text: '最近気に入っているものを話してみよう', category: '好きなもの', starter: '最近気に入っているのは〇〇です。〇〇なところがいいです。' },
  { id: '20', text: '好きな場所について話してみよう', category: '好きなもの', starter: '好きな場所は〇〇です。〇〇な雰囲気が好きです。' },
  { id: '21', text: '好きな音楽や曲があれば話してみよう', category: '好きなもの', starter: '好きな曲は〇〇です。聴くと〇〇な気分になります。' },
  { id: '22', text: '好きな作品（本・映画・マンガなど）を紹介してみよう', category: '好きなもの', starter: '好きな作品は〇〇です。特に〇〇なところが好きです。' },

  // 出来事 (6)
  { id: '23', text: '最近うれしかったことを話してみよう', category: '出来事', starter: '最近、〇〇があって嬉しかったです。' },
  { id: '24', text: '昨日あったことを一つ話してみよう', category: '出来事', starter: '昨日は〇〇がありました。少し〇〇だなと思いました。' },
  { id: '25', text: '最近ちょっとびっくりしたことを話してみよう', category: '出来事', starter: '最近、〇〇に少しびっくりしました。' },
  { id: '26', text: '今週やったことを話してみよう', category: '出来事', starter: '今週は〇〇をやりました。〇〇な一週間でした。' },
  { id: '27', text: '最近行ったことがある場所を話してみよう', category: '出来事', starter: '最近、〇〇に行きました。〇〇な場所でした。' },
  { id: '28', text: '最近食べておいしかったものを話してみよう', category: '出来事', starter: '最近食べて美味しかったのは〇〇です。' },

  // 自己紹介 (5)
  { id: '29', text: '自分の好きなことを一つ話してみよう', category: '自己紹介', starter: '私は〇〇です。最近は〇〇に少し興味があります。' },
  { id: '30', text: '自己紹介を10秒でやってみよう', category: '自己紹介', starter: '私は〇〇です。よろしくお願いします。' },
  { id: '31', text: '自分の得意なことを話してみよう', category: '自己紹介', starter: '私が得意なのは〇〇です。〇〇なときによく役立ちます。' },
  { id: '32', text: '自分がよくやることを一つ話してみよう', category: '自己紹介', starter: '私はよく〇〇をします。〇〇な時間が好きです。' },
  { id: '33', text: '自分のちょっとした習慣を話してみよう', category: '自己紹介', starter: '私には〇〇という習慣があります。' },

  // 説明練習 (6)
  { id: '34', text: '最近気になったことを説明してみよう', category: '説明練習', starter: '〇〇は、簡単に言うと〇〇です。たとえば、〇〇のようなものです。' },
  { id: '35', text: '好きなものをだれかに紹介するつもりで話してみよう', category: '説明練習', starter: '〇〇は、簡単に言うと〇〇です。たとえば、〇〇のようなものです。' },
  { id: '36', text: '今いる場所の様子を話してみよう', category: '説明練習', starter: '今いる場所は〇〇です。〇〇な様子です。' },
  { id: '37', text: '最近使ったお気に入りのものを説明してみよう', category: '説明練習', starter: '最近使っているのは〇〇です。〇〇なところが気に入っています。' },
  { id: '38', text: '今日の朝ごはん（または昼ごはん）を説明してみよう', category: '説明練習', starter: '今日のごはんは〇〇でした。〇〇な感じでした。' },
  { id: '39', text: '自分のルーティンを一つ説明してみよう', category: '説明練習', starter: '私は毎日〇〇をしています。〇〇な理由からです。' },

  // 意見練習 (5)
  { id: '40', text: '好きな季節と苦手な季節を話してみよう', category: '意見練習', starter: '私は〇〇だと思います。理由は、〇〇だからです。' },
  { id: '41', text: '朝型と夜型、自分はどっちか話してみよう', category: '意見練習', starter: '私は〇〇だと思います。理由は、〇〇だからです。' },
  { id: '42', text: '休日はどんなふうに過ごしたいか話してみよう', category: '意見練習', starter: '休日は〇〇に過ごしたいです。理由は〇〇だからです。' },
  { id: '43', text: '一人でいるのと大勢でいるの、どっちが好きか話してみよう', category: '意見練習', starter: '私は〇〇の方が好きです。理由は、〇〇だからです。' },
  { id: '44', text: 'ひとつ好きなことを変えるとしたら何か話してみよう', category: '意見練習', starter: 'もし変えるなら〇〇だと思います。理由は〇〇だからです。' },

  // 雑談練習 (5)
  { id: '45', text: '最近の天気について話してみよう', category: '雑談練習', starter: '最近、〇〇がありました。大きなことではないけど、少し印象に残っています。' },
  { id: '46', text: '昨日見たものや聞いたものを話してみよう', category: '雑談練習', starter: '昨日、〇〇を見ました（聞きました）。〇〇な感じでした。' },
  { id: '47', text: '最近笑ったこと・クスッとしたことを話してみよう', category: '雑談練習', starter: '最近、〇〇でちょっと笑いました。' },
  { id: '48', text: '今日の気温やお天気の感想を話してみよう', category: '雑談練習', starter: '今日は〇〇な天気でした。〇〇な一日でした。' },
  { id: '49', text: '今すぐ飲みたい飲み物を話してみよう', category: '雑談練習', starter: '今すぐ飲みたいのは〇〇です。' },

  // 発表ウォームアップ (5)
  { id: '50', text: '自分の名前と一言だけ話してみよう', category: '発表ウォームアップ', starter: 'これから〇〇について話します。まず、〇〇から説明します。' },
  { id: '51', text: '今日のテーマを一文で言ってみよう', category: '発表ウォームアップ', starter: '今日のテーマは〇〇です。' },
  { id: '52', text: '「えー」「あの」なしで10秒話してみよう', category: '発表ウォームアップ', starter: '〇〇について話します。まず〇〇です。次に〇〇です。' },
  { id: '53', text: 'ゆっくりはっきり、好きなものを話してみよう', category: '発表ウォームアップ', starter: '私が好きなのは〇〇です。ゆっくり話してみます。' },
  { id: '54', text: '「今日話したいこと」を一言で言ってみよう', category: '発表ウォームアップ', starter: '今日話したいことは〇〇です。' },

  // やさしい声出し (5)
  { id: '55', text: '「おはようございます」から始めて、今日の気分を話してみよう', category: 'やさしい声出し', starter: 'おはようございます。今、〇〇と声に出してみます。短くても、ここまでで大丈夫です。' },
  { id: '56', text: '声に出して、今日の日付を言ってみよう', category: 'やさしい声出し', starter: '今日は〇月〇日です。' },
  { id: '57', text: '好きな言葉や口癖を声に出してみよう', category: 'やさしい声出し', starter: '今、〇〇と声に出してみます。短くても、ここまでで大丈夫です。' },
  { id: '58', text: '「今日もよろしく」と声に出してみよう', category: 'やさしい声出し', starter: '今日もよろしくお願いします。' },
  { id: '59', text: '声に出して、自分に一言声をかけてみよう', category: 'やさしい声出し', starter: '今、〇〇と声に出してみます。短くても、ここまでで大丈夫です。' },
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
