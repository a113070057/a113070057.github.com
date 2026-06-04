import React, { useState, useEffect, useRef } from 'react';
import { Difficulty, SudokuBoard, SudokuCell, PlayerProfile } from '../types';
import { generateSudoku, formatTime } from '../utils/sudoku';
import { Undo, Eraser, Lightbulb, Brain, Award, Play, Home, Trophy, RefreshCw, XCircle, CheckCircle } from 'lucide-react';

interface GameViewProps {
  difficulty: Difficulty;
  profile: PlayerProfile;
  onGameFinish: (isWin: boolean, timeSpent: string, hintsUsed: number, errors: number) => void;
  onNavigate: (tab: 'home' | 'game' | 'leaderboard' | 'profile') => void;
  updateProfileCoins: (delta: number) => void;
}

export default function GameView({ difficulty, profile, onGameFinish, onNavigate, updateProfileCoins }: GameViewProps) {
  // Game state
  const [board, setBoard] = useState<SudokuBoard>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(null);
  const [errors, setErrors] = useState(0);
  const [notesMode, setNotesMode] = useState(false);
  const [timerSec, setTimerSec] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameSuccess, setGameSuccess] = useState(false);

  // History stack for Undo
  const [history, setHistory] = useState<SudokuBoard[]>([]);

  // AI Hint coaches
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTip, setAiTip] = useState<{ r: number; c: number; val: number; text: string } | null>(null);

  // Stats
  const hintCountRef = useRef(0);

  // Sound placeholders
  const playKeyPressSfx = () => {};

  // Setup puzzle board on load
  useEffect(() => {
    initPuzzle();
  }, [difficulty]);

  // Live timer interval
  useEffect(() => {
    if (gameOver || gameSuccess) return;
    const interval = setInterval(() => {
      setTimerSec(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [gameOver, gameSuccess]);

  const initPuzzle = () => {
    const { board: newBoard, solution: newSol } = generateSudoku(difficulty);
    setBoard(newBoard);
    setSolution(newSol);
    setSelected(null);
    setErrors(0);
    setTimerSec(0);
    setGameOver(false);
    setGameSuccess(false);
    setHistory([]);
    setAiTip(null);
    hintCountRef.current = 0;
  };

  // Push board copy to history stack for Undos
  const pushHistory = (currentBoard: SudokuBoard) => {
    const deepCopy = currentBoard.map(row => row.map(cell => ({ ...cell, notes: [...cell.notes] })));
    setHistory(prev => [...prev, deepCopy]);
  };

  const handleSelectCell = (r: number, c: number) => {
    setSelected({ r, c });
    playKeyPressSfx();
  };

  // Process selected cell digit input
  const handleInputDigit = (num: number) => {
    if (!selected) return;
    const { r, c } = selected;
    const cell = board[r][c];

    // Cannot modify fixed values
    if (cell.isInitial) return;

    pushHistory(board);

    if (notesMode) {
      // Toggle the input number in draft pencil notes
      const notesCopy = [...cell.notes];
      const idx = notesCopy.indexOf(num);
      if (idx !== -1) {
        notesCopy.splice(idx, 1);
      } else {
        notesCopy.push(num);
      }
      const updated = board.map((row, rIdx) =>
        row.map((cl, cIdx) => (rIdx === r && cIdx === c ? { ...cl, notes: notesCopy, value: 0 } : cl))
      );
      setBoard(updated);
    } else {
      // Overwrite cell value, clear notes
      const isCorrect = solution[r][c] === num;
      
      const updated = board.map((row, rIdx) =>
        row.map((cl, cIdx) => {
          if (rIdx === r && cIdx === c) {
            return {
              ...cl,
              value: num,
              notes: [],
              isError: !isCorrect
            };
          }
          return cl;
        })
      );

      setBoard(updated);

      if (!isCorrect) {
        const newErrorCount = errors + 1;
        setErrors(newErrorCount);
        if (newErrorCount >= 3) {
          setGameOver(true);
        }
      } else {
        // Correct entry, check completion
        checkGameCompletion(updated);
      }
    }
  };

  const handleUndo = () => {
    if (!history.length) return;
    const previous = history[history.length - 1];
    setBoard(previous);
    setHistory(prev => prev.slice(0, prev.length - 1));
  };

  const handleErase = () => {
    if (!selected) return;
    const { r, c } = selected;
    if (board[r][c].isInitial) return;

    pushHistory(board);
    const updated = board.map((row, rIdx) =>
      row.map((cl, cIdx) => (rIdx === r && cIdx === c ? { ...cl, value: 0, notes: [], isError: false } : cl))
    );
    setBoard(updated);
  };

  const handleRevealHint = () => {
    if (!selected) return;
    const { r, c } = selected;
    const targetCell = board[r][c];
    if (targetCell.isInitial || targetCell.value === solution[r][c]) return;

    // Correct target solution value
    const correctVal = solution[r][c];
    pushHistory(board);

    hintCountRef.current += 1;

    const updated = board.map((row, rIdx) =>
      row.map((cl, cIdx) => (rIdx === r && cIdx === c ? { ...cl, value: correctVal, notes: [], isError: false } : cl))
    );
    setBoard(updated);
    checkGameCompletion(updated);
  };

  // Live trigger for AI hint route
  const handleGetAiHint = async () => {
    if (gameOver || gameSuccess) return;
    
    // Find first empty cell on board to suggest a dynamic correct breakthrough
    let targetRow = -1;
    let targetCol = -1;
    let solvedCount = 0;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c].value === solution[r][c]) {
          solvedCount++;
        } else if (targetRow === -1) {
          targetRow = r;
          targetCol = c;
        }
      }
    }

    if (targetRow === -1) {
      alert('棋盤已完全填滿解出！');
      return;
    }

    setAiLoading(true);

    const targetVal = solution[targetRow][targetCol];

    try {
      // Build a simple grid representation
      const gridArray = board.map(row => row.map(cell => cell.value));

      const response = await fetch('/api/gemini-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grid: gridArray,
          solution,
          suggestedRow: targetRow,
          suggestedCol: targetCol,
          suggestedValue: targetVal,
          difficulty
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setAiTip({
          r: targetRow,
          c: targetCol,
          val: targetVal,
          text: data.hint
        });
      } else {
        // Fallback default tip explanation
        setAiTip({
          r: targetRow,
          c: targetCol,
          val: targetVal,
          text: `大師指南：請注意第 ${targetRow + 1} 行、第 ${targetCol + 1} 列，此格在 3x3 九宮格與同行同列規則中，排除其餘候選後，僅有數字 ${targetVal} 唯一的可能性。`
        });
      }
    } catch {
      setAiTip({
        r: targetRow,
        c: targetCol,
        val: targetVal,
        text: `大師指南：經過深度對位法推算，第 ${targetRow + 1} 行、第 ${targetCol + 1} 列唯一的正確答案是 ${targetVal}。建議點擊「套用此提示」填入。`
      });
    } finally {
      setAiLoading(false);
    }
  };

  const applyAiTip = () => {
    if (!aiTip) return;
    const { r, c, val } = aiTip;
    pushHistory(board);
    
    const updated = board.map((row, rIdx) =>
      row.map((cl, cIdx) => (rIdx === r && cIdx === c ? { ...cl, value: val, notes: [], isError: false } : cl))
    );
    setBoard(updated);
    setSelected({ r, c });
    setAiTip(null);
    checkGameCompletion(updated);
  };

  const checkGameCompletion = (currentBoard: SudokuBoard) => {
    // Audit current grid
    let success = true;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (currentBoard[r][c].value !== solution[r][c]) {
          success = false;
          break;
        }
      }
      if (!success) break;
    }

    if (success) {
      setGameSuccess(true);
      // Reward gold coins and level XP
      updateProfileCoins(150);
      onGameFinish(true, formatTime(timerSec), hintCountRef.current, errors);
    }
  };

  // Map difficulty name for local display
  const getDifficultyTitle = (diffStr: string) => {
    switch (diffStr) {
      case 'easy': return '初學者';
      case 'medium': return '中級';
      case 'hard': return '高級';
      case 'expert': return '地獄';
      case 'hell': return '惡夢模式';
      default: return '普通';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-12 animate-fade-in select-none">
      
      {/* Left Sidebar Info Banner (Desktop Only) */}
      <aside className="hidden lg:flex lg:col-span-3 flex-col gap-6">
        {/* User Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm">
          <div className="flex items-center gap-3.5 mb-4">
            <img
              src={profile.avatarUrl}
              alt="Avatar"
              className="w-12 h-12 rounded-xl object-cover bg-blue-50 border border-gray-100"
              referrerPolicy="no-referrer"
            />
            <div>
              <p className="font-bold text-gray-900 text-sm">{profile.name}</p>
              <p className="text-xs text-blue-600 font-semibold">當前排名: #128</p>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-gray-500">
              <span>等級 {profile.level} 經驗</span>
              <span>75%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 w-3/4"></div>
            </div>
          </div>
        </div>

        {/* Achievements Checklist Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex-grow">
          <h3 className="font-bold text-gray-950 text-sm mb-4">近期成就</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
              <Award className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="font-bold text-xs text-gray-800">急速解題</p>
                <p className="text-[10px] text-gray-400">5分鐘內完成困難模式</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2.5 bg-slate-55 bg-slate-50 border border-slate-100 rounded-xl opacity-60">
              <Award className="w-5 h-5 text-slate-400" />
              <div>
                <p className="font-bold text-xs text-gray-855">連勝王者</p>
                <p className="text-[10px] text-gray-400">連續7天完成每日挑戰</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Center Grid Panel */}
      <section className="lg:col-span-6 flex flex-col items-center gap-6">
        
        {/* Game Stats Metrics Header */}
        <div className="w-full grid grid-cols-3 gap-2 bg-slate-50 p-4 rounded-xl border border-gray-150 shadow-sm select-none text-center">
          <div className="flex flex-col items-center justify-center border-r border-gray-200">
            <span className="text-[10px] text-gray-400 font-bold uppercase">難度</span>
            <span className="font-extrabold text-sm text-red-650 text-red-600">
              {getDifficultyTitle(difficulty)}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center">
            <span className="text-[10px] text-gray-400 font-bold uppercase">計時器</span>
            <span className="font-mono font-black text-lg text-gray-800 tracking-wider">
              {formatTime(timerSec)}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center border-l border-gray-200">
            <span className="text-[10px] text-gray-400 font-bold uppercase">錯誤次數</span>
            <span className={`font-extrabold text-sm ${errors > 0 ? 'text-red-600' : 'text-gray-700'}`}>
              {errors} / 3
            </span>
          </div>
        </div>

        {/* 9x9 Classic Sudoku Board */}
        <div className="relative w-full max-w-[480px] aspect-square bg-gray-900 p-0.5 rounded-2xl shadow-xl overflow-hidden select-none">
          <div className="grid grid-cols-9 grid-rows-9 gap-[1px] bg-gray-300 h-full w-full">
            {board.map((row, rIdx) =>
              row.map((cell, cIdx) => {
                const isSelected = selected?.r === rIdx && selected?.c === cIdx;
                
                // Group highlights (same row, col, or box to guide cell solving)
                const isHighInSameRowOrCol = selected && (selected.r === rIdx || selected.c === cIdx);
                const isSameBox = selected && (Math.floor(selected.r / 3) === Math.floor(rIdx / 3) && Math.floor(selected.c / 3) === Math.floor(cIdx / 3));
                const isGroupHighlighted = (isHighInSameRowOrCol || isSameBox) && !isSelected;

                // Thicker grid lines mapping
                const thickRight = (cIdx + 1) % 3 === 0 && cIdx < 8;
                const thickBottom = (rIdx + 1) % 3 === 0 && rIdx < 8;

                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    onClick={() => handleSelectCell(rIdx, cIdx)}
                    className={`aspect-square flex flex-col items-center justify-center transition-all duration-150 cursor-pointer text-xl relative select-none
                      ${cell.isInitial ? 'bg-white font-black text-black' : 'bg-white text-blue-600 font-medium'}
                      ${isSelected ? '!bg-blue-100 ring-2 ring-blue-600 ring-inset z-10' : ''}
                      ${isGroupHighlighted && !isSelected ? 'bg-blue-50/50' : ''}
                      ${cell.isError ? '!bg-red-50 !text-red-600' : ''}
                      ${thickRight ? 'border-r-3 border-gray-900 border-r' : ''}
                      ${thickBottom ? 'border-b-3 border-gray-900 border-b' : ''}
                    `}
                  >
                    {/* Pencil note small candidates grid */}
                    {cell.value === 0 && cell.notes.length > 0 ? (
                      <div className="absolute inset-0.5 grid grid-cols-3 grid-rows-3 text-[10px] text-gray-400 font-bold leading-none p-0.5">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(noteVal => (
                          <div key={noteVal} className="flex items-center justify-center">
                            {cell.notes.includes(noteVal) ? noteVal : ''}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="font-extrabold text-lg lg:text-xl">{cell.value !== 0 ? cell.value : ''}</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* AI response popup tips container */}
        {aiTip && (
          <div className="w-full bg-blue-50 border border-blue-200 p-5 rounded-2xl shadow-md space-y-3 relative animate-fade-in max-w-[480px]">
            <button
              onClick={() => setAiTip(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-5 h-5" />
            </button>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🤖</span>
              <div>
                <h4 className="font-bold text-sm text-blue-900">大師 AI 智力提示</h4>
                <p className="text-xs text-blue-800 leading-relaxed mt-1">{aiTip.text}</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={applyAiTip}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow"
              >
                套用此提示
              </button>
            </div>
          </div>
        )}

        {/* Loading modal */}
        {aiLoading && (
          <div className="flex items-center gap-3 bg-white border border-gray-100 p-4 rounded-xl shadow-md py-6 max-w-[480px] w-full justify-center">
            <span className="text-2xl animate-spin">☕</span>
            <span className="text-xs font-bold text-gray-500">大師 AI 正在通宵推導解法，請稍候...</span>
          </div>
        )}

        {/* Action Controls for Mobile / Lower Row */}
        <div className="flex lg:hidden w-full gap-2 justify-center">
          <button
            onClick={handleGetAiHint}
            className="flex items-center gap-1.5 py-3 px-5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow"
          >
            <Brain className="w-4 h-4 fill-current animate-pulse" />
            AI 教學
          </button>
          <button
            onClick={() => setNotesMode(!notesMode)}
            className={`py-3 px-5 rounded-xl text-xs font-bold flex items-center gap-1.5 outline-none ${
              notesMode ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            筆記模式: {notesMode ? '開' : '關'}
          </button>
        </div>
      </section>

      {/* Right Sidebar Keypad & Actions panel */}
      <aside className="lg:col-span-3 space-y-6">
        {/* Keypad */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm">
          <div className="grid grid-cols-3 gap-2.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button
                key={num}
                onClick={() => handleInputDigit(num)}
                className="aspect-square bg-gray-50 hover:bg-blue-50 text-blue-600 border border-gray-100 hover:border-blue-200 active:scale-90 font-black text-2xl rounded-2xl flex items-center justify-center shadow-sm transition-all"
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Actions Box matching screen 5 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm space-y-6">
          <div className="flex justify-between items-center px-2 select-none">
            {/* Undo */}
            <button
              onClick={handleUndo}
              disabled={!history.length}
              className="flex flex-col items-center gap-1.5 focus:outline-none group disabled:opacity-40"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all text-gray-700 shadow-inner">
                <Undo className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-655 text-gray-605">撤銷</span>
            </button>

            {/* Eraser */}
            <button
              onClick={handleErase}
              className="flex flex-col items-center gap-1.5 focus:outline-none group"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all text-gray-700 shadow-inner">
                <Eraser className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-655 text-gray-605">擦除</span>
            </button>

            {/* Direct Hint placement */}
            <button
              onClick={handleRevealHint}
              className="flex flex-col items-center gap-1.5 focus:outline-none group"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all text-gray-700 shadow-inner relative">
                <Lightbulb className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  5
                </span>
              </div>
              <span className="text-xs font-bold text-gray-655 text-gray-605">提示</span>
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {/* AI Assistant button */}
            <button
              onClick={handleGetAiHint}
              disabled={aiLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 rounded-xl border-t border-blue-400 text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              <Brain className="w-4 h-4 fill-current" />
              AI 教學提示
            </button>

            {/* Notebook toggles */}
            <label className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-100 rounded-xl cursor-pointer select-none">
              <span className="font-bold text-xs text-gray-700 flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5" />
                筆記模式
              </span>
              <div className="relative inline-block w-12 h-6 rounded-full transition-colors duration-200 outline-none">
                <input
                  type="checkbox"
                  checked={notesMode}
                  onChange={() => setNotesMode(!notesMode)}
                  className="sr-only"
                />
                <div className={`w-12 h-6 rounded-full transition-colors ${notesMode ? 'bg-blue-600' : 'bg-gray-200'}`}>
                  <div className={`bg-white w-4 h-4 rounded-full shadow absolute top-1 transition-transform ${notesMode ? 'translate-x-7' : 'translate-x-1'}`} />
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Promo Themes card */}
        <div className="relative h-36 rounded-2xl overflow-hidden shadow border border-gray-100 group cursor-pointer">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBI5W3tPxkE8xa8NzvrJq8majnrrpzCM8hUnhmFlJeLtcWFxUEt66vx2hlNqjFCzmI1zvwpi18BTir8f9VS3cvO6tQLdjlqP5BN3hqRy5CNv-neOpE4ODEJ6Q4Sc0QXqSarnfGqJww4XGdWTFMb_SI3wcbQaWYlABThzSBjWJrCy6j0w0oXipqtey-mlYbZqoEkGObZgq_RDlpw1WOuCK0G41JSaKOTmd777doa1ACkHPpLE-yVvIbNgJaTam8XGz5WV-Ea2Cj14kd0"
            alt="Gold Theme Offer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
            <p className="text-white font-extrabold text-sm mb-0.5">解鎖黃金主題</p>
            <p className="text-white/70 text-[10px] font-semibold">獲取專屬棋盤與數字特效</p>
          </div>
        </div>
      </aside>

      {/* Game Over / Fail modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 max-w-sm w-full text-center space-y-6 shadow-2xl animate-scale-up">
            <div className="w-16 h-16 bg-red-100 text-red-650 text-red-600 rounded-full flex items-center justify-center text-3xl mx-auto shadow-inner">
              😞
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-gray-900">遊戲結束</h3>
              <p className="text-sm text-gray-500 mt-1">錯誤次數已達 3 次上限。再接再厲！</p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={initPuzzle}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 font-bold text-white text-xs rounded-xl flex items-center gap-1 shadow-md transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                再試一次
              </button>
              <button
                onClick={() => onNavigate('home')}
                className="px-5 py-2.5 border-2 border-gray-200 hover:bg-gray-50 font-bold text-gray-700 text-xs rounded-xl flex items-center gap-1 transition-all"
              >
                <Home className="w-4 h-4" />
                回首頁
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Success modal */}
      {gameSuccess && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 max-w-sm w-full text-center space-y-6 shadow-2xl animate-scale-up">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-650 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto shadow-inner">
              🏆
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-emerald-700">解鎖勝利！</h3>
              <p className="text-sm text-gray-500 mt-1">
                恭喜成功解開本局數獨！解題時間：{formatTime(timerSec)}，錯誤：{errors}次
              </p>
              <div className="mt-3 flex items-center justify-center gap-4 text-xs font-bold text-blue-600">
                <span>🪙 +150 金幣</span>
                <span>🔥 +150 XP 經驗值</span>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={initPuzzle}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 font-bold text-white text-xs rounded-xl flex items-center gap-1 shadow-md transition-all animate-pulse"
              >
                <Play className="w-4 h-4 fill-current" />
                下一局
              </button>
              <button
                onClick={() => onNavigate('home')}
                className="px-5 py-2.5 border-2 border-slate-205 border-gray-200 hover:bg-gray-50 font-bold text-gray-700 text-xs rounded-xl flex items-center gap-1 transition-all"
              >
                <Home className="w-4 h-4" />
                完工回首頁
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
