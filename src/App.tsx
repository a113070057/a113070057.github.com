import React, { useState, useEffect } from 'react';
import { Difficulty, PlayerProfile, RecentGame } from './types';
import HomeView from './components/HomeView';
import GameView from './components/GameView';
import LeaderboardView from './components/LeaderboardView';
import ProfileView from './components/ProfileView';
import { Award, Gamepad2, Trophy, Coins, User, Settings, List, Plus, Star } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'game' | 'leaderboard' | 'profile'>('home');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [gameInProgress, setGameInProgress] = useState(false);

  // Load profile from localStorage or fallback to specifications
  const [profile, setProfile] = useState<PlayerProfile>(() => {
    const saved = localStorage.getItem('sudoku_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      name: '智力探險家 #882',
      level: 24,
      xp: 4500,
      maxXp: 6000,
      gamesPlayed: 342,
      wins: 298,
      winRate: 87,
      totalHintsUsed: 42,
      bestTimeExpert: '08:24',
      goldCoins: 1250,
      avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDXYHKa37LZaQy9A3f0VD7qHRLYleB8oqVRu6zlABcRhNd6xwH0s_CTNGzUI6Z_rw6HlKURQeJeJI6DV5Rsls25BDvAVEob-0nd1PFhsEYcOljDoBhFX1v0LgmWM5AeQCQhRPoN5wnDLlFxxgq9xACKbU4fV8P-DiWilTbLUvFAWwQSRX5BryohW0HnP4J-s1q2DbXVgjx2eM2aPcCvLKkCG2HMP2__kzDs1F4o0QG5gqYuMvgPeoBIWrkhFZk_FboskErPWjMWeSHg"
    };
  });

  // Load recent games history list from localStorage or load specifies
  const [recentGames, setRecentGames] = useState<RecentGame[]>(() => {
    const saved = localStorage.getItem('sudoku_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('sudoku_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('sudoku_history', JSON.stringify(recentGames));
  }, [recentGames]);

  // Handle game finish (updates profile level, gold coins, counts and history list)
  const handleGameFinish = (isWin: boolean, timeSpent: string, hintsUsed: number, errors: number) => {
    if (isWin) {
      // Create new history entry
      const newEntry: RecentGame = {
        id: Date.now().toString(),
        difficulty: difficulty === 'easy' ? '簡單模式' : difficulty === 'medium' ? '中級模式' : difficulty === 'hard' ? '困難模式' : '專家模式',
        isCompleted: true,
        timeSpent,
        date: new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' }),
        hintsUsed,
        errorsCount: errors,
        xpGained: difficulty === 'easy' ? 40 : difficulty === 'medium' ? 80 : difficulty === 'hard' ? 120 : 150
      };

      setRecentGames(prev => [newEntry, ...prev]);

      // Update user stats
      setProfile(prev => {
        const nextXp = prev.xp + newEntry.xpGained;
        let nextLevel = prev.level;
        let nextMaxXp = prev.maxXp;
        let currentXp = nextXp;

        if (currentXp >= nextMaxXp) {
          nextLevel += 1;
          currentXp = currentXp - nextMaxXp;
          nextMaxXp = Math.floor(nextMaxXp * 1.25);
        }

        const nextGamesPlayed = prev.gamesPlayed + 1;
        const nextWins = prev.wins + 1;
        const nextWinRate = Math.round((nextWins / nextGamesPlayed) * 100);

        return {
          ...prev,
          level: nextLevel,
          xp: currentXp,
          maxXp: nextMaxXp,
          gamesPlayed: nextGamesPlayed,
          wins: nextWins,
          winRate: nextWinRate,
          totalHintsUsed: prev.totalHintsUsed + hintsUsed,
          goldCoins: prev.goldCoins + 150 // Reward gold coins
        };
      });
    }

    setGameInProgress(false);
  };

  const handleStartGame = (diff: Difficulty) => {
    setDifficulty(diff);
    setGameInProgress(true);
    setActiveTab('game');
  };

  const handleEarnCoins = (delta: number) => {
    setProfile(prev => ({
      ...prev,
      goldCoins: prev.goldCoins + delta
    }));
  };

  return (
    <div className="bg-[#f7f9fb] min-h-screen font-sans antialiased text-gray-800 pb-16 md:pb-6 flex flex-col">
      {/* Top Main Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4 md:px-6 h-16">
          <div className="flex items-center gap-4">
            <h1
              onClick={() => { setActiveTab('home'); setGameInProgress(false); }}
              className="font-extrabold text-2xl text-blue-600 tracking-tight cursor-pointer select-none"
            >
              數獨大師
            </h1>
            
            {/* Desktop Nav tabs */}
            <nav className="hidden md:flex gap-6 ml-10 select-none">
              <button
                onClick={() => { setActiveTab('home'); setGameInProgress(false); }}
                className={`text-sm font-semibold py-1 transition-all ${
                  activeTab === 'home' ? 'text-blue-600 border-b-2 border-blue-600 font-bold' : 'text-gray-500 hover:text-blue-600'
                }`}
              >
                首頁
              </button>
              <button
                onClick={() => handleStartGame('medium')}
                className={`text-sm font-semibold py-1 transition-all ${
                  activeTab === 'game' ? 'text-blue-600 border-b-2 border-blue-600 font-bold' : 'text-gray-500 hover:text-blue-600'
                }`}
              >
                每日挑戰
              </button>
              <button
                onClick={() => { setActiveTab('leaderboard'); setGameInProgress(false); }}
                className={`text-sm font-semibold py-1 transition-all ${
                  activeTab === 'leaderboard' ? 'text-blue-600 border-b-2 border-blue-600 font-bold' : 'text-gray-500 hover:text-blue-600'
                }`}
              >
                排行榜
              </button>
              <button
                onClick={() => { setActiveTab('profile'); setGameInProgress(false); }}
                className={`text-sm font-semibold py-1 transition-all ${
                  activeTab === 'profile' ? 'text-blue-600 border-b-2 border-blue-600 font-bold' : 'text-gray-500 hover:text-blue-600'
                }`}
              >
                成就
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Gold Coins balance indicator with buy trigger */}
            <div
              id="gold_coins_balance"
              onClick={() => handleEarnCoins(500)}
              className="flex items-center bg-blue-50 hover:bg-blue-100 text-blue-700 px-3.5 py-1.5 rounded-full select-none cursor-pointer border border-blue-200 shadow-sm transition-all text-xs font-bold gap-1"
              title="點擊儲值獲得 1,250 金幣"
            >
              <Coins className="w-4 h-4 fill-current text-yellow-500" />
              <span>{profile.goldCoins.toLocaleString()}</span>
            </div>

            {/* Profile Avatar Trigger button */}
            <button
              onClick={() => { setActiveTab('profile'); setGameInProgress(false); }}
              className="w-10 h-10 rounded-full border-2 border-gray-105 border-blue-200 overflow-hidden shadow-sm hover:scale-105 active:scale-95 transition-all outline-none bg-blue-50 shrink-0"
            >
              <img
                src={profile.avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container routes */}
      <main className="max-w-6xl mx-auto w-full px-4 md:px-6 py-6 flex-grow">
        {activeTab === 'home' && (
          <HomeView
            profile={profile}
            onStartGame={handleStartGame}
            onNavigate={(tab) => { setActiveTab(tab); setGameInProgress(false); }}
          />
        )}

        {activeTab === 'game' && gameInProgress && (
          <GameView
            difficulty={difficulty}
            profile={profile}
            onGameFinish={handleGameFinish}
            onNavigate={(tab) => { setActiveTab(tab); setGameInProgress(false); }}
            updateProfileCoins={handleEarnCoins}
          />
        )}

        {activeTab === 'game' && !gameInProgress && (
          <div className="h-[480px] flex flex-col justify-center items-center text-center space-y-4 max-w-sm mx-auto">
            <span className="text-4xl">🧩</span>
            <h3 className="font-extrabold text-xl">目前沒有進行中的賽局</h3>
            <p className="text-sm text-gray-500">
              您可以直接點擊下方按鈕以預設的難度（中級）建立挑戰，或者前往首頁選擇多段難度。
            </p>
            <button
              onClick={() => handleStartGame('medium')}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md h-12 flex items-center justify-center"
            >
              全新開始中級賽事
            </button>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView onStartGame={handleStartGame} />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            profile={profile}
            recentGames={recentGames}
            onStartGame={handleStartGame}
            updateProfileCoins={handleEarnCoins}
          />
        )}
      </main>

      {/* Mobile Navigation bar matching screen specifications precisely */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 bg-white/95 backdrop-blur-md shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)] rounded-t-2xl border-t border-gray-100 select-none">
        <button
          onClick={() => { setActiveTab('home'); setGameInProgress(false); }}
          className={`flex flex-col items-center justify-center p-2 outline-none rounded-xl active:scale-95 transition-all ${
            activeTab === 'home' ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-gray-500'
          }`}
        >
          <Gamepad2 className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-bold">遊戲</span>
        </button>
        <button
          onClick={() => { setActiveTab('leaderboard'); setGameInProgress(false); }}
          className={`flex flex-col items-center justify-center p-2 outline-none rounded-xl active:scale-95 transition-all ${
            activeTab === 'leaderboard' ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-gray-500'
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-bold">排行</span>
        </button>
        <button
          onClick={() => { setActiveTab('profile'); setGameInProgress(false); }}
          className={`flex flex-col items-center justify-center p-2 outline-none rounded-xl active:scale-95 transition-all ${
            activeTab === 'profile' ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-gray-500'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-bold">設定</span>
        </button>
      </nav>
    </div>
  );
}
