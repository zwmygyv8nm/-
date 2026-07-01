'use client';

type WelcomeCardProps = {
  onClose: () => void;
};

export default function WelcomeCard({ onClose }: WelcomeCardProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-7 flex flex-col gap-5">
        <div className="text-center">
          <p className="text-4xl mb-3">🌱</p>
          <h2 className="text-lg font-bold text-gray-700">はじめまして</h2>
          <p className="text-sm text-gray-400 mt-1">このアプリについて</p>
        </div>

        <div className="flex flex-col gap-3">
          {[
            { icon: '✅', text: 'うまく話す必要はありません' },
            { icon: '⏱️', text: '5秒だけでも、声が出せたら成功です' },
            { icon: '🔒', text: '音声ファイルは保存されません' },
            { icon: '💛', text: '毎日少しずつ、気軽に続けましょう' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 bg-pink-50 rounded-2xl px-4 py-3">
              <span className="text-lg">{icon}</span>
              <p className="text-sm text-gray-600">{text}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-400 to-purple-400 text-white font-medium active:scale-95 transition-transform"
        >
          はじめる
        </button>
      </div>
    </div>
  );
}
