import React, { useState } from 'react';
import { LeaderboardRecord } from '../types';
import { Trophy, Award, Calendar, ChevronRight } from 'lucide-react';

interface LeaderboardViewProps {
  onStartGame: (diff: any) => void;
}

export default function LeaderboardView({ onStartGame }: LeaderboardViewProps) {
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'history'>('today');

  // Hardcoded real podium avatars from the prompt's HTML sources
  const avatars = {
    rank1: "https://lh3.googleusercontent.com/aida-public/AB6AXuC7vSCcTql0r4JOAlAq4Q_HuPO-6xmZhpHBY7OW6heigthkOo6HQz-pmv-d49jXcBPxjqmHdPIKszDEDMEoVk2D2YKZiCi_BDBCkVAk3Kn20WYiNPgYreDgnAeNtv99mq3BG1tB_60-P1ki2Js2ycXJtc4BF663S5bhGmKHt6xTKKTr-HlCJZN7lNW4jbJOqEIwoE0xtI_CwOcgao0tsx6HXNxiu1evwGMGKpcFGH9WUwexVXJab-npzPynPP66VoYQeJLlBFy35gO4",
    rank2: "https://lh3.googleusercontent.com/aida-public/AB6AXuC3NkWZvXEDZT-jel76UqvePd6bT4UOOgUlamjx4rkp3ytcJlTkkpUvif-YWUESHo6T69RoRnB-qhs3Tup2-9Z5gIShny7Wp1ejMdt6VFluhK4IVxPSByHnVLPa6ZepV0dd8Jihpvb8Fpmb31jGayu_kSBLy5olxlrS4pOLhVFHNJ43TdoiuncaVg0olTETzCZSPfsPDLqGGnFkELzk3lLBZd-nMOkjOoYgTF6s7CQ6n43mjC7PN92PNUaY2Gefajp7jzWiVjhwB_qY",
    rank3: "https://lh3.googleusercontent.com/aida-public/AB6AXuAkmhAXNE44hRPMBK-4c6AUYw49AGCbQ56ovSGf4TKT7hEy4ogYqQZYOaOG7kvnXmEtMCzMG3Lno1SrjJQjXxCVlZ7U48b8NqdhnjooLlGVJaEDPVLlm6hgl9V0wBPkc-6GZkzNDYTj2c4lwa_K5xM3G5m_5DYANwHrpOfcVtYq9FkP69Refu9AJa37LMzltLCGWUqdiVsrR5s-P6U48ZANr_PJXTf8Qo71x8efFUo8WUn7aN10Gbo-ZhbKoHytjFC4Cn_4VgpXd2ZZ",
    rank4: "https://lh3.googleusercontent.com/aida-public/AB6AXuAMKRFrHAJabE18S6dpu2xtx7roX8xW2J3R1vkfeNWFscYxYcsE7c9AFRaGrNc57kJeCXtB4VdjEM17flxPMlnGQtqmUUTdD48QVi49itIPQAuaHw0TtmHl_QWPWcvmvsAfkW2gEpAXUwaWpQhL_FJIvtoF9qElGMbn-gHHJ-OG-LVitSJWnjmD3HO5xw7SF3H0FsB8oKRlZ2f2i95x1QuXPYraLgFaojbgkuFCfJbxhuyfhFl4dDczdqVOP-CfON8U9nXcPcUxEPG2",
    rank5: "https://lh3.googleusercontent.com/aida-public/AB6AXuBURPMjQqZauLohmcP63tK5QpNuwlwK36WJJ4CQYfV7PIRs4mrWv5OeIiJ_8EPwDaHruWiUCZ3yaT592ezaLUPiT1XBxaan_mv-ZOqloeakMgaznOgJwvxBi4cKEA4Mlro6ylOgWrnO47JmqU7tp7LdxHhJX5qcoY9d1focTRsZtnl5BjSh7WVkAU9dsGc6a5dtFvIib4yNrei8vNpPjhP32nnM2lqQhdTPAmzJ0pW5e2z1V8cBt6ynMo5tH7pMz3YwiUecBJgncTW6",
    rank6: "https://lh3.googleusercontent.com/aida-public/AB6AXuDX2YDWOyLWt1vwHMb2cTGgC1xzyzL3WTU6x9fIXFfxRjbRtSJ3gmzl6UiRpNBgb7R3HLl8mh_FkuPJJI1_OZ0tltuMhTbp7ecYrOi8I1FVYn0zYV-h6oCSNmj-qLZ_xGmV5UfKrAW77cY1CBGpgV61ywo1SopaoXG5BlaX666AYO5z9e1ZbY7w21pu7rMy6LI9ECUhcOvimpbDLCxRKlnj1dZAb-_c4VL9bMdXFf1kOU8EMVNr3EtPYoKRFGf3BCkCUeDl_xQGc9HS",
    rank7: "https://lh3.googleusercontent.com/aida-public/AB6AXuAoAWHy3Fxe8KedN_R6fZL_bqdxypP6HtL08yxPG1OuRiHo6ina_KIgwRmNjP9xTiPBzxTIi_gGtQmdtIqdpdcHzkycW2tZTMsxN2itULta53T-riNaUiM-Gf5Sn_MCBSfegfXajXH4lDVw-VDKdjd-uWK1OXF2QUi49GprKqbf7GSoxsld5zu7tQNwUIPIkSpSbY8Qvln94oS8p_SFmEaJGCk88TBCcuyyVCkBi_R9DRuJg4fftQJGyivr3ta7p_Y9e506QYpb4Fju",
    myAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBSkOZl9wFt2chEXmr2sY-5bCx29th1_l9uX4CDsP2HJv2U4SvNqPJPxpioMLUp8JAaqyQChZCJpGNvE0kupI5b1USyiC5nB9I5po-8OYu9SJAvfgFhaZfRshzKExTIxew_9CAx8cbehh9NAR_C-OlOaKnDUTYYBko3PoJOX_POJOX_FEfkCDQCO797oxF7Hj2-mEbfq-qmglUPua-olIFhThbfowtxNiyjSKfwKGOaI_Wan7SAc1vOdoXlqo-8J1sJ1l2YjG9ZYP5v_yPZSg"
  };

  // Static mock leaderboard data matching the requested pages
  const records: Record<typeof activeTab, LeaderboardRecord[]> = {
    today: [
      { rank: 4, name: '快手小李', time: '04:22', date: '2023.11.15', avatarUrl: avatars.rank4 },
      { rank: 5, name: '數獨狂人', time: '04:45', date: '2023.11.15', avatarUrl: avatars.rank5 },
      { rank: 6, name: '邏輯大師', time: '05:10', date: '2023.11.15', avatarUrl: avatars.rank6 },
      { rank: 7, name: '小陳', time: '05:38', date: '2023.11.15', avatarUrl: avatars.rank7 },
    ],
    week: [
      { rank: 4, name: '解題微風', time: '04:12', date: '2023.11.12', avatarUrl: avatars.rank5 },
      { rank: 5, name: '大腦閃電', time: '04:30', date: '2023.11.14', avatarUrl: avatars.rank4 },
      { rank: 6, name: '快手小李', time: '04:41', date: '2023.11.15', avatarUrl: avatars.rank6 },
      { rank: 7, name: '數字詩人', time: '05:02', date: '2023.11.10', avatarUrl: avatars.rank7 },
    ],
    history: [
      { rank: 4, name: '黃金解題者', time: '03:10', date: '2023.08.12', avatarUrl: avatars.rank6 },
      { rank: 5, name: '神算奇才', time: '03:19', date: '2023.09.05', avatarUrl: avatars.rank4 },
      { rank: 6, name: '全能智慧', time: '03:32', date: '2023.10.01', avatarUrl: avatars.rank5 },
      { rank: 7, name: '數讀狂人', time: '03:45', date: '2023.11.15', avatarUrl: avatars.rank7 },
    ]
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="text-3xl font-black text-gray-950 tracking-tight">全球排行榜</h2>
          <p className="text-gray-500 font-medium">挑戰你的極限，與全球數獨高手一較高下</p>
        </div>
        
        {/* Toggle switches */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl self-start border border-gray-200">
          <button
            onClick={() => handleTabChange('today')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'today' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            今日最快
          </button>
          <button
            onClick={() => handleTabChange('week')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'week' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            本週最快
          </button>
          <button
            onClick={() => handleTabChange('history')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            歷史紀錄
          </button>
        </div>
      </div>

      {/* Podium Columns Section */}
      <div className="grid grid-cols-3 gap-3 md:gap-6 items-end pt-8 pb-4 max-w-4xl mx-auto select-none">
        {/* Rank 2 Column */}
        <div className="flex flex-col items-center group">
          <div className="relative mb-3">
            <div className="w-16 h-16 md:w-24 md:h-24 rounded-full border-4 border-slate-300 overflow-hidden shadow-lg transition-transform group-hover:scale-105 bg-gray-150">
              <img
                src={avatars.rank2}
                alt="Silver Medalist"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-gradient-to-b from-slate-300 to-slate-500 text-white font-extrabold flex items-center justify-center border-2 border-white text-xs">
              2
            </div>
          </div>
          
          {/* Silver Podium Pillar */}
          <div className="bg-gradient-to-b from-slate-300 to-slate-400 w-full h-24 md:h-32 rounded-t-2xl shadow-md flex flex-col items-center justify-center p-3 text-center text-white">
            <span className="font-extrabold text-sm md:text-base truncate w-full">王小明</span>
            <span className="text-xs font-semibold text-white/90">03:42</span>
          </div>
        </div>

        {/* Rank 1 Column (Outstanding) */}
        <div className="flex flex-col items-center group -translate-y-4">
          <div className="relative mb-3">
            {/* Crown Bounce Indicator */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2">
              <span className="text-3xl filter drop-shadow animate-bounce">👑</span>
            </div>
            
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-amber-400 overflow-hidden shadow-xl transition-transform group-hover:scale-105 bg-gray-150">
              <img
                src={avatars.rank1}
                alt="Gold Medalist"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 text-white font-extrabold flex items-center justify-center border-2 border-white text-sm">
              1
            </div>
          </div>
          
          {/* Gold Podium Pillar */}
          <div className="bg-gradient-to-b from-amber-400 to-amber-500 w-full h-32 md:h-40 rounded-t-2xl shadow-lg flex flex-col items-center justify-center p-3 text-center text-white border-t border-amber-300">
            <span className="font-black text-base md:text-lg truncate w-full">SudokuKing</span>
            <span className="text-sm font-bold text-white/95">02:15</span>
          </div>
        </div>

        {/* Rank 3 Column */}
        <div className="flex flex-col items-center group">
          <div className="relative mb-3">
            <div className="w-16 h-16 md:w-24 md:h-24 rounded-full border-4 border-amber-750 border-orange-700/30 overflow-hidden shadow-lg transition-transform group-hover:scale-105 bg-gray-150">
              <img
                src={avatars.rank3}
                alt="Bronze Medalist"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-gradient-to-b from-orange-400 to-orange-750 bg-orange-700 text-white font-extrabold flex items-center justify-center border-2 border-white text-xs">
              3
            </div>
          </div>
          
          {/* Bronze Podium Pillar */}
          <div className="bg-gradient-to-b from-orange-500 to-orange-650 bg-orange-600 w-full h-20 md:h-24 rounded-t-2xl shadow-md flex flex-col items-center justify-center p-3 text-center text-white">
            <span className="font-extrabold text-sm md:text-base truncate w-full">林美美</span>
            <span className="text-xs font-semibold text-white/90">04:01</span>
          </div>
        </div>
      </div>

      {/* Leaderboard Table List */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-150 max-w-4xl mx-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">排名</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">玩家</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">時間</th>
              <th className="hidden md:table-cell px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">日期</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records[activeTab].map((record) => (
              <tr key={record.rank} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="w-8 h-8 flex items-center justify-center font-bold text-gray-800 text-base">{record.rank}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <img
                      src={record.avatarUrl}
                      alt={record.name}
                      className="w-10 h-10 rounded-full border border-gray-100 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="font-bold text-gray-800 text-sm">{record.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-bold text-blue-600 text-sm">
                  {record.time}
                </td>
                <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-xs text-gray-400 font-semibold">
                  {record.date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sticky Player Rank Display matching screen 2 precisely */}
      <div className="fixed bottom-16 md:bottom-3 left-0 w-full px-4 z-40 select-none">
        <div className="max-w-4xl mx-auto bg-blue-600 text-white p-5 rounded-2xl md:rounded-3xl shadow-xl flex items-center justify-between border border-blue-400 animate-slide-up">
          <div className="flex items-center gap-3 md:gap-5">
            {/* Round slot Coin Counter */}
            <div className="bg-white/10 border border-white/20 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-black text-lg md:text-xl shadow-inner text-white">
              128
            </div>
            
            <div className="flex items-center gap-3">
              <img
                src={avatars.myAvatar}
                alt="My Avatar"
                className="w-12 h-12 md:w-16 h-16 rounded-full border-2 border-white/50 shadow-sm object-cover bg-gray-50"
                referrerPolicy="no-referrer"
              />
              <div>
                <span className="block font-black text-base md:text-lg">我的排名</span>
                <span className="text-xs text-white/80 font-semibold font-mono">玩家：阿龍</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="block font-black text-2xl md:text-3xl font-mono">06:45</span>
            <span className="text-[10px] md:text-xs font-bold text-white/80">今日個人最佳</span>
          </div>
        </div>
      </div>
    </div>
  );
}
