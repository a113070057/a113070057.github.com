import React, { useState } from 'react';
import { PlayerProfile, RecentGame } from '../types';
import { Award, Gamepad2, Trophy, PieChart, Lightbulb, Compass, CheckCircle, XCircle, Volume2, Music, Sun, Moon, Sparkles, Settings } from 'lucide-react';

interface ProfileViewProps {
  profile: PlayerProfile;
  recentGames: RecentGame[];
  onStartGame: (diff: any) => void;
  updateProfileCoins: (delta: number) => void;
}

export default function ProfileView({ profile, recentGames, onStartGame, updateProfileCoins }: ProfileViewProps) {
  // Switch values for the quick settings toggles
  const [sfx, setSfx] = useState(true);
  const [bgm, setBgm] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Filter out recent games or use a default mock list if empty to replicate the screenshot
  const displayGames: RecentGame[] = recentGames.length ? recentGames : [
    { id: '1', difficulty: '專家模式', isCompleted: true, timeSpent: '12:45', date: '2023年10月24日', hintsUsed: 0, errorsCount: 0, xpGained: 150 },
    { id: '2', difficulty: '每日挑戰', isCompleted: true, timeSpent: '09:12', date: '2023年10月23日', hintsUsed: 1, errorsCount: 2, xpGained: 100 },
    { id: '3', difficulty: '惡夢模式', isCompleted: false, timeSpent: '進行 24:00', date: '2023年10月22日', hintsUsed: 3, errorsCount: 3, xpGained: 0 },
    { id: '4', difficulty: '困難模式', isCompleted: true, timeSpent: '07:33', date: '2023年10月21日', hintsUsed: 0, errorsCount: 1, xpGained: 80 },
    { id: '5', difficulty: '簡單模式', isCompleted: true, timeSpent: '03:15', date: '2023年10月20日', hintsUsed: 0, errorsCount: 0, xpGained: 40 }
  ];

  return (
    <div className="space-y-8 pb-16 animate-fade-in">
      {/* Upper Profile Box */}
      <section className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg border-4 border-gray-100 flex items-center justify-center bg-blue-100">
              <img
                src={profile.avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Level badge */}
            <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white font-black w-9 h-9 rounded-full flex items-center justify-center text-sm border-2 border-white shadow-md">
              {profile.level}
            </div>
          </div>
          
          <div className="flex-grow w-full space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">智力探險家 #882</h2>
              <span className="text-xs font-bold text-gray-500 font-mono">經驗值: {profile.xp} / {profile.maxXp} XP</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-1000"
                style={{ width: `${(profile.xp / profile.maxXp) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => updateProfileCoins(500)}
              className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-150 hover:bg-blue-100 active:scale-95 transition-all text-sm font-bold rounded-xl flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              獲取金幣
            </button>
          </div>
        </div>
      </section>

      {/* Stats Bento Grid elements */}
      <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* Play counts */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 flex flex-col justify-between hover:shadow-md transition-all">
          <p className="text-xs text-gray-505 font-bold mb-3">已遊玩場數</p>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black text-blue-600">{profile.gamesPlayed}</span>
            <Gamepad2 className="w-8 h-8 text-blue-105 opacity-40" />
          </div>
        </div>

        {/* Wins */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 flex flex-col justify-between hover:shadow-md transition-all">
          <p className="text-xs text-gray-505 font-bold mb-3">獲勝次數</p>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black text-emerald-600">{profile.wins}</span>
            <Trophy className="w-8 h-8 text-emerald-105 opacity-40" />
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 flex flex-col justify-between hover:shadow-md transition-all">
          <p className="text-xs text-gray-505 font-bold mb-3">獲勝率</p>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black text-indigo-600">{profile.winRate}%</span>
            <PieChart className="w-8 h-8 text-indigo-105 opacity-40" />
          </div>
        </div>

        {/* Total Hint counts */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 flex flex-col justify-between hover:shadow-md transition-all">
          <p className="text-xs text-gray-505 font-bold mb-3">總提示使用</p>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black text-rose-600">{profile.totalHintsUsed}</span>
            <Lightbulb className="w-8 h-8 text-rose-105 opacity-40" />
          </div>
        </div>

        {/* Best Expert Time - Blue Highlight card */}
        <div className="bg-blue-600 text-white p-5 rounded-2xl shadow-md col-span-2 md:col-span-4 lg:col-span-1 flex flex-col justify-center select-none">
          <p className="text-white/80 text-xs font-bold mb-2">最佳時間 (專家)</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-extrabold font-mono">{profile.bestTimeExpert}</span>
            <span className="text-xs text-white/70 font-semibold">分鐘</span>
          </div>
        </div>
      </section>

      {/* Lists vs System settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Game List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-600" />
              最近遊戲
            </h3>
            <span className="text-xs text-gray-400 font-semibold">自動儲存歷史</span>
          </div>

          <div className="space-y-3">
            {displayGames.map((game) => (
              <div
                key={game.id}
                className={`bg-white p-4 rounded-xl shadow-sm border-l-4 flex items-center justify-between border-t border-r border-b border-gray-100 ${
                  game.isCompleted ? 'border-l-emerald-500' : 'border-l-rose-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${game.isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {game.isCompleted ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-800">{game.difficulty} - {game.isCompleted ? '勝利' : '未完成'}</h4>
                    <p className="text-xs text-gray-500">{game.date} · 花費 {game.timeSpent}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`block font-black text-sm ${game.isCompleted ? 'text-blue-600' : 'text-gray-400'}`}>
                    {game.isCompleted ? `+${game.xpGained} XP` : '+0 XP'}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-450 text-gray-400">
                    {game.isCompleted ? `提示: ${game.hintsUsed}` : `錯誤: ${game.errorsCount}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audio switches & tips */}
        <div className="space-y-6">
          <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            快速設定
          </h3>

          <div className="bg-white p-5 rounded-2xl border border-gray-150 space-y-4">
            {/* Audio switch */}
            <div className="flex items-center justify-between p-1.5 hover:bg-gray-50 rounded-xl transition-all h-12">
              <div className="flex items-center gap-3 text-gray-700">
                <Volume2 className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-semibold">音效效果</span>
              </div>
              <button
                onClick={() => setSfx(!sfx)}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 outline-none ${
                  sfx ? 'bg-blue-600' : 'bg-gray-250 bg-gray-200'
                }`}
              >
                <div
                  className={`bg-white w-5 h-5 rounded-full shadow-sm transition-transform duration-200 ${
                    sfx ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* BGM switch */}
            <div className="flex items-center justify-between p-1.5 hover:bg-gray-50 rounded-xl transition-all h-12">
              <div className="flex items-center gap-3 text-gray-700">
                <Music className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-semibold">背景音樂</span>
              </div>
              <button
                onClick={() => setBgm(!bgm)}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 outline-none ${
                  bgm ? 'bg-blue-600' : 'bg-gray-250 bg-gray-200'
                }`}
              >
                <div
                  className={`bg-white w-5 h-5 rounded-full shadow-sm transition-transform duration-200 ${
                    bgm ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Dark theme switch */}
            <div className="flex items-center justify-between p-1.5 hover:bg-gray-50 rounded-xl transition-all h-12">
              <div className="flex items-center gap-3 text-gray-700">
                {darkMode ? <Moon className="w-5 h-5 text-blue-500" /> : <Sun className="w-5 h-5 text-gray-500" />}
                <span className="text-sm font-semibold">深色模式</span>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 outline-none ${
                  darkMode ? 'bg-blue-600' : 'bg-gray-250 bg-gray-200'
                }`}
              >
                <div
                  className={`bg-white w-5 h-5 rounded-full shadow-sm transition-transform duration-200 ${
                    darkMode ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Tips matching screenshot */}
          <div className="bg-sky-50 text-sky-900 border border-sky-100 p-5 rounded-2xl flex items-start gap-4 hover:shadow-sm transition-all group">
            <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 shrink-0">
              <Lightbulb className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h4 className="font-bold text-sm mb-1 text-sky-850">大師秘訣</h4>
              <p className="text-xs text-sky-700 leading-relaxed">
                嘗試使用「筆記模式」標記可能性，這能大幅提升解題速度！在筆記模式下填入多重候選數。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
