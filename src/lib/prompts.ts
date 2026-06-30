export type Prompt = {
  id: string;
  text: string;
  category: string;
};

export const prompts: Prompt[] = [
  { id: '1', text: '今日の予定を10秒で話してみよう', category: '今日の予定' },
  { id: '2', text: '今の気分を一言で話してみよう', category: '気分' },
  { id: '3', text: '好きな食べ物について10秒話してみよう', category: '好きなもの' },
  { id: '4', text: '昨日あったことを30秒で話してみよう', category: '出来事' },
  { id: '5', text: '最近うれしかったことを話してみよう', category: '出来事' },
  { id: '6', text: '好きな作品を紹介してみよう', category: '好きなもの' },
  { id: '7', text: '今日がんばりたいことを話してみよう', category: '今日の予定' },
  { id: '8', text: '自己紹介を20秒で話してみよう', category: '自己紹介' },
  { id: '9', text: '最近気になったことを説明してみよう', category: '説明練習' },
  { id: '10', text: '明日の予定を話してみよう', category: '今日の予定' },
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
