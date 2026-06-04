import React from 'react';
import { Difficulty, PlayerProfile } from '../types';
import { Play, Calendar, Trophy, Star, Award, TrendingUp, Timer, Sparkles } from 'lucide-react';

interface HomeViewProps {
  profile: PlayerProfile;
  onStartGame: (diff: Difficulty) => void;
  onNavigate: (tab: 'home' | 'game' | 'leaderboard' | 'profile') => void;
}

export default function HomeView({ profile, onStartGame, onNavigate }: HomeViewProps) {
  // Mock grid for the interactive board preview
  const previewGrid = [
    5, 3, 0, 0, 7, 0, 0, 0, 0,
    6, 0, 0, 1, 9, 5, 0, 0, 0,
    0, 9, 8, 0, 0, 0, 0, 6, 0,
    8, 0, 0, 0, 6, 0, 0, 0, 3,
    4, 0, 0, 8, 0, 3, 0, 0, 1,
    7, 0, 0, 0, 2, 0, 0, 0, 6,
    0, 6, 0, 0, 0, 0, 2, 8, 0,
    0, 0, 0, 4, 1, 9, 0, 0, 5,
    0, 0, 0, 0, 8, 0, 0, 7, 9
  ];

  return (
    <div className="space-y-12 pb-16 animate-fade-in">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs border border-blue-200">
            <Star className="w-4 h-4 mr-1.5 fill-current" />
            Google Play 年度最佳益智遊戲
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {/* App Icon matching screenshot 1 */}
              <div id="sudoku_app_icon" className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg relative border-2 border-blue-400">
                {/* Visual architectural grid representation */}
                <div className="absolute inset-2 border border-white/20 grid grid-cols-3 grid-rows-3 opacity-60">
                  <div className="border border-white/10"></div>
                  <div className="border border-white/10"></div>
                  <div className="border border-white/10"></div>
                </div>
                <span className="text-white font-extrabold text-3xl font-sans relative z-10">9</span>
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-blue-400 border border-white rounded-full flex items-center justify-center">
                  <Star className="w-2.5 h-2.5 text-white fill-current" />
                </span>
              </div>
              <div>
                <h1 className="font-extrabold text-4xl text-blue-900 tracking-tight">數獨大師</h1>
                <p className="font-mono text-xl text-blue-600 font-bold tracking-wider">Sudoku Master</p>
              </div>
            </div>

            <p className="text-gray-600 text-base leading-relaxed max-w-lg">
              挑戰腦力極限，成為數獨宗師。沉浸在優雅的介面中，體驗最純粹的邏輯之美。
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              id="start_game_quick"
              onClick={() => onStartGame('medium')}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white rounded-xl font-bold flex items-center gap-2 shadow-md"
            >
              <Play className="w-5 h-5 fill-current" />
              開始遊戲
            </button>
            <button
              id="daily_challenge_btn"
              onClick={() => onStartGame('expert')}
              className="px-6 py-3.5 bg-sky-100 hover:bg-sky-200 text-sky-800 rounded-xl font-bold flex items-center gap-2 transition-all"
            >
              <Calendar className="w-5 h-5" />
              每日挑戰
            </button>
            <button
              id="leaderboard_nav_btn"
              onClick={() => onNavigate('leaderboard')}
              className="px-6 py-3.5 border-2 border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-bold flex items-center gap-2 transition-all"
            >
              <Trophy className="w-5 h-5" />
              排行榜
            </button>
          </div>

          {/* Core App Information Indicators */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100 max-w-lg">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">全球玩家</p>
              <p className="text-2xl font-black text-blue-900">1.2M+</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">今日完賽</p>
              <p className="text-2xl font-black text-emerald-600">45,820</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">活躍賽事</p>
              <p className="text-2xl font-black text-amber-600">12</p>
            </div>
          </div>
        </div>

        {/* Home Screen Interactive board preview */}
        <div className="lg:col-span-6 flex justify-center">
          <div
            id="board_preview"
            onClick={() => onStartGame('medium')}
            className="cursor-pointer bg-white p-6 rounded-3xl shadow-xl border border-gray-150 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl max-w-[420px] w-full group relative"
          >
            {/* Visual pattern background accents */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-100 rounded-full blur-2xl opacity-70"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-sky-100 rounded-full blur-3xl opacity-70"></div>

            <div className="relative z-10 grid grid-cols-9 gap-[1px] bg-gray-300 p-[1.5px] rounded-xl overflow-hidden shadow-inner">
              {previewGrid.map((num, i) => {
                const isFixed = num !== 0;
                // Add thicker subgrid borders
                const borderRight = (i + 1) % 3 === 0 && (i + 1) % 9 !== 0 ? 'border-r bg-gray-100' : '';
                const borderBottom = Math.floor(i / 9) % 3 === 2 && Math.floor(i / 9) < 8 ? 'border-b' : '';

                return (
                  <div
                    key={i}
                    className={`aspect-square flex items-center justify-center bg-white text-base ${isFixed ? 'font-bold text-gray-900' : 'text-blue-500'} 
                      ${borderRight ? 'border-r-2 border-gray-400' : ''} 
                      ${borderBottom ? 'border-b-2 border-gray-400' : ''} 
                      group-hover:bg-blue-50/10 transition-colors duration-150`}
                  >
                    {num || ''}
                  </div>
                );
              })}
            </div>
            <div className="text-center mt-3 text-xs text-blue-600 font-semibold group-hover:underline">
              👉 點擊此處直接開始挑戰！
            </div>
          </div>
        </div>
      </section>

      {/* Bento Board Selection Grid */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">選擇你的戰場</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Difficulty Grid selection */}
          <div className="md:col-span-2 bg-slate-50 p-6 rounded-3xl border border-gray-100 flex flex-col justify-between hover:translate-y-[-2px] transition-all">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-1">多段難度</h3>
                <p className="text-sm text-gray-500">從入門到地獄，挑戰自我的極限</p>
              </div>
              <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2.5">
              <button
                id="diff_easy"
                onClick={() => onStartGame('easy')}
                className="px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200 text-xs font-bold transition-all"
              >
                初學者
              </button>
              <button
                id="diff_medium"
                onClick={() => onStartGame('medium')}
                className="px-4 py-2 rounded-full bg-blue-100 text-blue-800 border border-blue-205 hover:bg-blue-200 text-xs font-bold transition-all"
              >
                中級
              </button>
              <button
                id="diff_hard"
                onClick={() => onStartGame('hard')}
                className="px-4 py-2 rounded-full bg-indigo-100 text-indigo-805 border border-indigo-200 hover:bg-indigo-200 text-xs font-bold transition-all"
              >
                高級
              </button>
              <button
                id="diff_expert"
                onClick={() => onStartGame('expert')}
                className="px-4 py-2 rounded-full bg-rose-100 text-rose-800 border border-rose-200 hover:bg-rose-200 text-xs font-bold transition-all"
              >
                地獄
              </button>
            </div>
          </div>

          {/* Achievement card display */}
          <div
            id="achievements_card"
            onClick={() => onNavigate('profile')}
            className="cursor-pointer bg-slate-50 p-6 rounded-3xl border border-gray-100 hover:translate-y-[-2px] transition-all relative overflow-hidden group"
          >
            <h3 className="font-bold text-lg text-gray-900 mb-1">個人成就</h3>
            <p className="text-sm text-gray-500 mb-6">紀錄你的成長足跡</p>
            
            <div className="flex gap-2">
              <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center shadow-sm">
                <Trophy className="w-5 h-5 text-white fill-current" />
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center shadow-sm">
                <Star className="w-5 h-5 text-white fill-current" />
              </div>
            </div>

            <Award className="absolute -right-4 -bottom-4 w-24 h-24 text-gray-200/50 group-hover:scale-110 transition-transform duration-300" />
          </div>

          {/* Rank Summary card */}
          <div
            id="ranking_quick_card"
            onClick={() => onNavigate('leaderboard')}
            className="cursor-pointer bg-blue-600 p-6 rounded-3xl text-white shadow-md hover:translate-y-[-2px] transition-all flex flex-col justify-between"
          >
            <div>
              <h3 className="font-bold text-lg mb-1 text-white">全球排名</h3>
              <p className="text-white/80 text-xs">與全球高手同台對決</p>
            </div>
            
            <div className="flex justify-between items-end mt-4">
              <div>
                <span className="text-4xl font-black leading-none">#128</span>
                <span className="text-xs ml-1.5 opacity-90">阿龍</span>
              </div>
              <div className="px-2.5 py-1 bg-white/20 rounded-md flex items-center gap-1 text-xs font-bold">
                <TrendingUp className="w-3.5 h-3.5" />
                勝率 87%
              </div>
            </div>
          </div>

          {/* Daily Puzzle countdown */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-gray-100 hover:translate-y-[-2px] transition-all flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base text-gray-900 mb-0.5">每日一題</h3>
              <p className="text-xs text-gray-500 mb-4">今日剩餘: 14:22:05</p>
              
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
                <div className="bg-blue-600 w-3/4 h-full rounded-full"></div>
              </div>
            </div>
            
            <button
              onClick={() => onStartGame('expert')}
              className="w-full py-2 bg-white text-blue-600 hover:bg-blue-50 border border-blue-250 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-all"
            >
              立即破解
            </button>
          </div>

          {/* Statistics grid sections */}
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-gray-150 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Timer className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500">平均解題時間</p>
                <p className="text-xl font-bold text-gray-800">04:25</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-150 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500">大師指數 (M-Index)</p>
                <p className="text-xl font-bold text-gray-800">2,840</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
