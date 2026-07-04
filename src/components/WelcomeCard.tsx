'use client';

type WelcomeCardProps = {
  onClose: () => void;
};

export default function WelcomeCard({ onClose }: WelcomeCardProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-7 flex flex-col gap-5">
        <div className="text-center">
          <p className="text-4xl mb-3">🌱</p>
          <h2 className="text-lg font-bold text-stone-700">はじめまして</h2>
          <p className="text-sm text-stone-400 mt-1">このアプリについて</p>
        </div>

        <div className="flex flex-col gap-2">
          {[
            'うまく話す必要はありません',
            '5秒だけでも、声が出せたら成功です',
            '音声ファイルは保存されません',
            '毎日少しずつ、気軽に続けましょう',
          ].map((text) => (
            <div key={text} className="bg-stone-50 rounded-xl px-4 py-3">
              <p className="text-sm text-stone-600">{text}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-400 to-rose-500 text-white font-medium active:scale-95 transition-transform"
        >
          はじめる
        </button>
      </div>
    </div>
  );
}
