import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Info, X, ArrowUp, ArrowDown, Check, Search, Timer, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import playersData from '../../json/nba.json';
import mediumPlayers from '../../json/nba_medium.json';

// Interface for the player data
interface Player {
  Name: string;
  "All-Star": number;
  DPOY: number;
  MVP: number;
  ROTY: number;
  FMVP: number;
  "Six-Man": number;
  "All-NBA": number;
  "Draft-Year": number;
  imageUrl?: string;
}

interface DailyStats {
  daysWon: number;
  daysLost: number;
  totalGuessesForWins: number;
}

interface DailyLeaderboardEntry {
  username: string;
  daysWon: number;
  daysLost: number;
  totalGuessesForWins: number;
  averageGuesses: number;
  lastSubmittedDate: string;
  date: string;
}

// Helper function to get player headshot image URL from basketball-reference
const getPlayerImageUrl = (name: string): string => {
  try {
    const cleanName = name.trim();
    const parts = cleanName.split(/\s+/);
    if (parts.length < 2) return '/placeholder.svg';

    const last = parts[1].replace(/[^a-zA-Z]/g, '').substring(0, 5).toLowerCase();
    const first = parts[0].replace(/[^a-zA-Z]/g, '').substring(0, 2).toLowerCase();

    return `https://www.basketball-reference.com/req/202106291/images/headshots/${last}${first}01.jpg`;
  } catch {
    return '/placeholder.svg';
  }
};

const getMockDailyLeaderboard = (): DailyLeaderboardEntry[] => {
  return [
    { username: "KingJames23", daysWon: 45, daysLost: 5, totalGuessesForWins: 125, averageGuesses: 2.78, lastSubmittedDate: "2026-05-28", date: "2026-05-28T23:00:00.000Z" },
    { username: "CurryCooking30", daysWon: 40, daysLost: 6, totalGuessesForWins: 130, averageGuesses: 3.25, lastSubmittedDate: "2026-05-28", date: "2026-05-28T23:00:00.000Z" },
    { username: "LukaMagic77", daysWon: 38, daysLost: 8, totalGuessesForWins: 114, averageGuesses: 3.00, lastSubmittedDate: "2026-05-28", date: "2026-05-28T23:00:00.000Z" },
    { username: "JokerTripleDouble", daysWon: 35, daysLost: 2, totalGuessesForWins: 105, averageGuesses: 3.00, lastSubmittedDate: "2026-05-28", date: "2026-05-28T23:00:00.000Z" },
    { username: "GreekFreak34", daysWon: 32, daysLost: 10, totalGuessesForWins: 112, averageGuesses: 3.50, lastSubmittedDate: "2026-05-28", date: "2026-05-28T23:00:00.000Z" }
  ];
};

const NBA_STATS_KEYS: (keyof Player)[] = [
  'Draft-Year',
  'All-Star',
  'All-NBA',
  'MVP',
  'FMVP',
  'DPOY',
  'ROTY',
  'Six-Man'
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.3 }
  }
};

const tileVariants = {
  hidden: { rotateX: 90, opacity: 0 },
  visible: (i: number) => ({
    rotateX: 0,
    opacity: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: "easeOut"
    }
  })
};

function NBADailyGame() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<'playing' | 'ended'>('playing');
  const [attempts, setAttempts] = useState(0);
  const [targetPlayer, setTargetPlayer] = useState<Player | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [guessedPlayers, setGuessedPlayers] = useState<Player[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [dateString, setDateString] = useState('');
  const [secondsUntilMidnight, setSecondsUntilMidnight] = useState(0);

  // Daily stats
  const [stats, setStats] = useState<DailyStats>({
    daysWon: 0,
    daysLost: 0,
    totalGuessesForWins: 0
  });

  const [submittedDates, setSubmittedDates] = useState<Record<string, boolean>>({});

  const [leaderboardTab, setLeaderboardTab] = useState<'local' | 'global'>('local');
  const [leaderboardRankings, setLeaderboardRankings] = useState<DailyLeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardUsername, setLeaderboardUsername] = useState('');
  const [isDark, setIsDark] = useState<boolean>(() => localStorage.getItem('nba_theme') === 'dark');
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(0);

  useEffect(() => {
    setActiveSuggestionIndex(0);
  }, [searchResults]);

  const toggleTheme = () => setIsDark(prev => {
    const next = !prev;
    localStorage.setItem('nba_theme', next ? 'dark' : 'light');
    return next;
  });

  // 1. Calculate running time until local midnight
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
      setSecondsUntilMidnight(diff);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Load daily stats and determine player on load
  useEffect(() => {
    setAllPlayers(playersData.players as unknown as Player[]);

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    setDateString(todayStr);

    const mediumList = mediumPlayers.players as unknown as Player[];
    if (mediumList.length > 0) {
      let hash = 0;
      for (let i = 0; i < todayStr.length; i++) {
        const char = todayStr.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
      }
      const index = Math.abs(hash) % mediumList.length;
      setTargetPlayer(mediumList[index]);
    }

    const savedStats = localStorage.getItem('nbaDaily_stats');
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (e) {
        console.error("Failed to parse saved stats:", e);
      }
    }

    const savedSubmissions = localStorage.getItem('nbaDaily_submittedDates');
    if (savedSubmissions) {
      try {
        setSubmittedDates(JSON.parse(savedSubmissions));
      } catch (e) {
        console.error("Failed to parse submitted dates:", e);
      }
    }

    const lastPlayedDate = localStorage.getItem('nbaDaily_lastPlayedDate');
    if (lastPlayedDate === todayStr) {
      const savedState = localStorage.getItem('nbaDaily_gameState') as 'playing' | 'ended';
      const savedGuesses = localStorage.getItem('nbaDaily_guessedPlayers');
      const savedAttempts = localStorage.getItem('nbaDaily_attempts');

      if (savedState) setGameState(savedState);
      if (savedGuesses) setGuessedPlayers(JSON.parse(savedGuesses));
      if (savedAttempts) setAttempts(Number(savedAttempts));
    } else {
      setGameState('playing');
      setGuessedPlayers([]);
      setAttempts(0);
      localStorage.setItem('nbaDaily_lastPlayedDate', todayStr);
      localStorage.setItem('nbaDaily_gameState', 'playing');
      localStorage.setItem('nbaDaily_guessedPlayers', JSON.stringify([]));
      localStorage.setItem('nbaDaily_attempts', '0');
    }
  }, []);

  useEffect(() => {
    if (showScoreModal && leaderboardTab === 'global') {
      fetchLeaderboard();
    }
  }, [showScoreModal, leaderboardTab]);

  const fetchLeaderboard = async () => {
    setLeaderboardLoading(true);
    try {
      const res = await fetch(`/.netlify/functions/leaderboard?gameMode=nba-daily&difficulty=daily`);
      if (!res.ok) throw new Error("HTTP error " + res.status);
      const data = await res.json();
      setLeaderboardRankings(data);
    } catch (err) {
      console.warn("Using simulated leaderboard fallback:", err);
      const mockData = getMockDailyLeaderboard();
      const localSimulated = localStorage.getItem(`nbaDaily_simulated_leaderboard`);
      if (localSimulated) {
        setLeaderboardRankings(JSON.parse(localSimulated));
      } else {
        setLeaderboardRankings(mockData);
        localStorage.setItem(`nbaDaily_simulated_leaderboard`, JSON.stringify(mockData));
      }
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const handleScoreSubmit = async () => {
    if (!leaderboardUsername.trim() || !targetPlayer) return;
    const username = leaderboardUsername.trim().substring(0, 20);
    const isWin = guessedPlayers[0]?.Name === targetPlayer.Name;
    const guessesCount = attempts;

    setLeaderboardLoading(true);
    try {
      const res = await fetch(`/.netlify/functions/leaderboard?gameMode=nba-daily&difficulty=daily`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, isWin, guesses: guessesCount, clientDate: dateString })
      });
      if (!res.ok) throw new Error("HTTP error " + res.status);
      const data = await res.json();
      setLeaderboardRankings(data.scores);

      const newSubmissions = { ...submittedDates, [dateString]: true };
      setSubmittedDates(newSubmissions);
      localStorage.setItem('nbaDaily_submittedDates', JSON.stringify(newSubmissions));
      localStorage.setItem('nbaDaily_submittedName', username);
    } catch (err) {
      console.warn("Using simulated score submission fallback:", err);
      let list: DailyLeaderboardEntry[] = [];
      const localSimulated = localStorage.getItem(`nbaDaily_simulated_leaderboard`);
      if (localSimulated) {
        list = JSON.parse(localSimulated);
      } else {
        list = getMockDailyLeaderboard();
      }

      const existingIndex = list.findIndex(e => e.username.toLowerCase() === username.toLowerCase());
      if (existingIndex !== -1) {
        const entry = list[existingIndex];
        if (entry.lastSubmittedDate !== dateString) {
          if (isWin) {
            entry.daysWon += 1;
            entry.totalGuessesForWins += guessesCount;
            entry.averageGuesses = Number((entry.totalGuessesForWins / entry.daysWon).toFixed(2));
          } else {
            entry.daysLost += 1;
          }
          entry.lastSubmittedDate = dateString;
          entry.date = new Date().toISOString();
        }
      } else {
        list.push({
          username,
          daysWon: isWin ? 1 : 0,
          daysLost: isWin ? 0 : 1,
          totalGuessesForWins: isWin ? guessesCount : 0,
          averageGuesses: isWin ? guessesCount : 0,
          lastSubmittedDate: dateString,
          date: new Date().toISOString()
        });
      }

      list.sort((a, b) => {
        if (b.daysWon !== a.daysWon) {
          return b.daysWon - a.daysWon;
        }
        const aAvg = a.daysWon > 0 ? a.averageGuesses : Infinity;
        const bAvg = b.daysWon > 0 ? b.averageGuesses : Infinity;
        if (aAvg !== bAvg) {
          return aAvg - bAvg;
        }
        if (a.daysLost !== b.daysLost) {
          return a.daysLost - b.daysLost;
        }
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });

      const updatedList = list.slice(0, 100);
      localStorage.setItem(`nbaDaily_simulated_leaderboard`, JSON.stringify(updatedList));
      setLeaderboardRankings(updatedList);

      const newSubmissions = { ...submittedDates, [dateString]: true };
      setSubmittedDates(newSubmissions);
      localStorage.setItem('nbaDaily_submittedDates', JSON.stringify(newSubmissions));
      localStorage.setItem('nbaDaily_submittedName', username);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const handleGuess = (playerToGuess?: Player) => {
    if (gameState === 'ended') return;
    const query = playerToGuess ? playerToGuess.Name : searchQuery;
    if (!query || !targetPlayer) return;

    let guessedPlayer = playerToGuess || allPlayers.find(p => p.Name.toLowerCase() === query.toLowerCase());

    // Auto-select/fill top name if no exact match but suggestions exist
    if (!guessedPlayer && searchResults.length > 0) {
      const topMatch = searchResults[0];
      guessedPlayer = allPlayers.find(p => p.Name.toLowerCase() === topMatch.Name.toLowerCase());
    }

    if (!guessedPlayer) {
      setErrorMessage('Please select a valid player from the list');
      return;
    }

    setErrorMessage(null);
    const newAttempts = attempts + 1;
    const newGuesses = [guessedPlayer, ...guessedPlayers];

    setAttempts(newAttempts);
    setGuessedPlayers(newGuesses);
    setSearchQuery('');
    setSearchResults([]);
    setShowSuggestions(false);
    setActiveSuggestionIndex(0);

    localStorage.setItem('nbaDaily_attempts', String(newAttempts));
    localStorage.setItem('nbaDaily_guessedPlayers', JSON.stringify(newGuesses));

    // Focus the text box for the next guess
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    if (guessedPlayer.Name === targetPlayer.Name || newAttempts >= 6) {
      setGameState('ended');
      localStorage.setItem('nbaDaily_gameState', 'ended');

      const lastRecordedDate = localStorage.getItem('nbaDaily_lastRecordedDate');
      if (lastRecordedDate !== dateString) {
        const isWin = guessedPlayer.Name === targetPlayer.Name;
        const updatedStats = {
          daysWon: isWin ? stats.daysWon + 1 : stats.daysWon,
          daysLost: isWin ? stats.daysLost : stats.daysLost + 1,
          totalGuessesForWins: isWin ? stats.totalGuessesForWins + newAttempts : stats.totalGuessesForWins
        };
        setStats(updatedStats);
        localStorage.setItem('nbaDaily_stats', JSON.stringify(updatedStats));
        localStorage.setItem('nbaDaily_lastRecordedDate', dateString);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && searchResults.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestionIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestionIndex(prev => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selectedPlayer = searchResults[activeSuggestionIndex];
        if (selectedPlayer) {
          handleGuess(selectedPlayer);
        }
      }
    } else if (e.key === 'Enter') {
      handleGuess();
    }
  };

  const getStatStatus = (stat: keyof Player, guessed: number, target: number): 'correct' | 'close' | 'incorrect' => {
    if (guessed === target) return 'correct';
    if (stat === 'ROTY') return 'incorrect';
    const diff = Math.abs(guessed - target);
    if (stat === 'All-Star' || stat === 'Draft-Year') {
      return diff <= 3 ? 'close' : 'incorrect';
    }
    return diff === 1 ? 'close' : 'incorrect';
  };

  const renderArrow = (stat: keyof Player, guessed: number, target: number) => {
    if (guessed === target) return <Check className="w-4 h-4 text-current" />;
    return guessed > target ?
      <ArrowDown className="w-4 h-4 text-current" /> :
      <ArrowUp className="w-4 h-4 text-current" />;
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    const results = allPlayers.filter(player =>
      player.Name.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(results.slice(0, 5));
  };

  const formatTime = (sec: number) => {
    const h = String(Math.floor(sec / 3600)).padStart(2, '0');
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className={`nba-page${isDark ? ' dark' : ''} min-h-screen py-8 px-4 flex flex-col items-center`}>
      <div className="max-w-2xl w-full nba-court-bg">
        {/* Header */}
        <motion.header
          className="flex justify-between items-center border-b border-[var(--border-color)] pb-4 mb-8"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex-1 flex justify-start">
            <motion.button
              onClick={() => navigate('/')}
              className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-white transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="text-center px-4">
            <h1 className="game-title text-2xl sm:text-3xl font-extrabold tracking-wider">
              NBA DAILY
            </h1>
            <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider font-semibold">
              Today: {dateString}
            </p>
          </div>

          <div className="flex-1 flex justify-end gap-2">
            <motion.button
              onClick={toggleTheme}
              className="theme-toggle-btn p-2 rounded-lg hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)] transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9, rotate: 20 }}
              title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {isDark
                ? <Sun className="w-5 h-5 text-[var(--gold)]" />
                : <Moon className="w-5 h-5 text-[var(--text-secondary)]" />}
            </motion.button>
            <motion.button
              onClick={() => setShowModal(true)}
              className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)] transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Info className="w-5 h-5 text-[var(--text-secondary)]" />
            </motion.button>
            <motion.button
              onClick={() => {
                setShowScoreModal(true);
                const pastName = localStorage.getItem('nbaDaily_submittedName') || '';
                setLeaderboardUsername(pastName);
              }}
              className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)] transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Trophy className="w-5 h-5 text-[var(--text-secondary)] hover:text-[#fdb927]" />
            </motion.button>
          </div>
        </motion.header>

        {/* Desktop switcher and Attempts info */}

        {/* Guesser Input Block */}
        {gameState === 'playing' && (
          <motion.div
            className="mb-8 relative z-40"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                  setShowSuggestions(true);
                  setErrorMessage(null);
                }}
                onKeyDown={handleKeyDown}
                className="player-input w-full py-3 px-4 pl-12 pr-24 rounded-xl text-base bg-[var(--bg-secondary)] text-white border border-[var(--border-color)] focus:border-[var(--text-secondary)] focus:outline-none transition-all placeholder:text-[var(--text-secondary)]"
                placeholder="Search for today's player..."
                autoComplete="off"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] w-5 h-5" />
              <button
                onClick={() => handleGuess()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg bg-[var(--nba-blue)] hover:bg-[#15346e] text-white text-sm font-bold uppercase tracking-wider transition-colors border border-[var(--nba-blue)]"
              >
                GUESS
              </button>
            </div>

            {errorMessage && (
              <div className="text-red-500 mt-2 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {showSuggestions && searchResults.length > 0 && (
              <div className="absolute z-50 w-full max-w-2xl mt-1 bg-[var(--bg-secondary)]/85 backdrop-blur-md rounded-xl shadow-2xl border border-[var(--border-color)] max-h-60 overflow-y-auto">
                {searchResults.map((player, index) => (
                  <button
                    key={player.Name}
                    className={`w-full text-left px-4 py-3 transition-colors text-white font-medium text-sm ${index === activeSuggestionIndex
                        ? 'bg-[var(--bg-tertiary)] font-bold'
                        : 'hover:bg-[var(--bg-tertiary)]/50'
                      }`}
                    onClick={() => handleGuess(player)}
                  >
                    {player.Name}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* End Game Stats Info Reveal */}
        {gameState === 'ended' && targetPlayer && (
          <motion.div
            className="mb-8 p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-center"
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h3 className="text-2xl font-bold text-white mb-2">
              {guessedPlayers[0]?.Name === targetPlayer.Name ? 'Winner!' : 'Game Over'}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-5">
              {guessedPlayers[0]?.Name === targetPlayer.Name
                ? `You correctly identified the mystery player in ${attempts} tries.`
                : `The correct player was ${targetPlayer.Name}`}
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-md mx-auto">
              <div className="flex items-center gap-2 p-3 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] w-full sm:w-auto justify-center">
                <Timer className="w-4 h-4 text-[var(--gold)]" />
                <span className="text-xs text-[var(--text-secondary)] font-medium mr-1">Next player in:</span>
                <span className="font-mono text-sm font-bold text-[var(--gold)]">{formatTime(secondsUntilMidnight)}</span>
              </div>

              {!submittedDates[dateString] && (
                <button
                  onClick={() => {
                    setShowScoreModal(true);
                    setLeaderboardTab('global');
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-lg bg-[var(--nba-red)] hover:bg-[#a60d24] text-white text-xs font-bold uppercase tracking-wider transition-colors border border-[var(--nba-red)] shadow-lg shadow-[#c8102e]/15"
                >
                  Submit Score
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Guesses Matrix Grid */}
        <div className="space-y-6">
          {/* Target Player Card if game ended and user lost */}
          {gameState === 'ended' && targetPlayer && guessedPlayers[0]?.Name !== targetPlayer.Name && (
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/10">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={getPlayerImageUrl(targetPlayer.Name)}
                  alt={targetPlayer.Name}
                  className="w-10 h-10 rounded-full object-cover border border-red-500/30"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                <div>
                  <h4 className="font-bold text-white text-base leading-tight">{targetPlayer.Name}</h4>
                  <span className="text-xs text-red-400 font-semibold uppercase tracking-wider">Correct Answer</span>
                </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {NBA_STATS_KEYS.map((key) => {
                  const val = targetPlayer[key];
                  return (
                    <div key={key} className="stat-tile correct">
                      <span className="text-[10px] uppercase font-bold text-white/80 select-none text-center truncate w-full px-1">{key === 'Draft-Year' ? 'Year' : key}</span>
                      <span className="stat-value text-white">{val}</span>
                      <span className="text-[10px] font-bold text-white/80 select-none">✓</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* User Guesses */}
          <motion.div
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {guessedPlayers.map((player) => {
              const isWin = player.Name === targetPlayer?.Name;
              return (
                <motion.div
                  key={player.Name}
                  className={`p-4 rounded-xl border ${isWin ? 'border-[var(--color-correct)]/40 bg-[var(--color-correct)]/5' : 'border-[var(--border-color)] bg-[var(--bg-secondary)]'}`}
                  variants={itemVariants}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={getPlayerImageUrl(player.Name)}
                      alt={player.Name}
                      className={`w-9 h-9 rounded-full object-cover border ${isWin ? 'border-[var(--color-correct)]' : 'border-[var(--border-color)]'}`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    <h4 className="font-bold text-white text-base leading-tight">{player.Name}</h4>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {NBA_STATS_KEYS.map((key, statIdx) => {
                      const guessedVal = player[key] as number;
                      const targetVal = targetPlayer ? (targetPlayer[key] as number) : 0;
                      const status = targetPlayer ? getStatStatus(key, guessedVal, targetVal) : 'incorrect';

                      return (
                        <motion.div
                          key={key}
                          custom={statIdx}
                          variants={tileVariants}
                          className={`stat-tile ${status}`}
                        >
                          <span className="text-[10px] uppercase font-bold opacity-70 select-none text-center truncate w-full px-1">{key === 'Draft-Year' ? 'Year' : key}</span>
                          <span className="stat-value">{guessedVal}</span>
                          <span className="text-[9px] font-bold opacity-70 select-none flex items-center justify-center">
                            {renderArrow(key, guessedVal, targetVal)}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Info Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[var(--bg-secondary)] rounded-2xl p-6 max-w-md w-full border border-[var(--border-color)] shadow-2xl relative"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute right-4 top-4 p-1.5 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors border border-[var(--border-color)]"
              >
                <X className="w-4 h-4 text-[var(--text-secondary)]" />
              </button>
              <h2 className="text-xl font-bold text-white mb-4">How to Play: Daily Mode</h2>
              <div className="space-y-3 text-sm text-[var(--text-secondary)] leading-relaxed">
                <p>Every day, a mystery player is selected from the NBA database. You have exactly 6 attempts to guess them.</p>
                <p>After each guess, the tiles will change colors depending on how close your stats are to the target player:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><span className="text-white font-bold bg-[var(--color-correct)] px-1.5 py-0.5 rounded text-xs mr-1">Blue</span> is a perfect match.</li>
                  <li><span className="text-[#0a0d14] font-bold bg-[var(--color-close)] px-1.5 py-0.5 rounded text-xs mr-1">White</span> is a close match (within 3 for Year/All-Star; within 1 for other awards).</li>
                  <li><span className="text-white font-bold bg-[var(--color-incorrect)] px-1.5 py-0.5 rounded text-xs mr-1">Red</span> is completely incorrect.</li>
                </ul>
                <p>Arrows (↑ or ↓) indicate whether the correct player's stat is higher or lower than your guess.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Score Modal */}
      <AnimatePresence>
        {showScoreModal && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[var(--bg-secondary)] rounded-2xl p-6 max-w-xl w-full border border-[var(--border-color)] shadow-2xl flex flex-col max-h-[80vh] relative"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <button
                onClick={() => setShowScoreModal(false)}
                className="absolute right-4 top-4 p-1.5 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors border border-[var(--border-color)]"
              >
                <X className="w-4 h-4 text-[var(--text-secondary)]" />
              </button>

              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[var(--gold)]" />
                Daily Statistics
              </h2>

              <div className="flex border-b border-[var(--border-color)] mb-6">
                <button
                  onClick={() => setLeaderboardTab('local')}
                  className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-all ${leaderboardTab === 'local'
                      ? 'border-[var(--nba-blue)] text-white font-bold'
                      : 'border-transparent text-[var(--text-secondary)] hover:text-white'
                    }`}
                >
                  My Stats
                </button>
                <button
                  onClick={() => setLeaderboardTab('global')}
                  className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-all ${leaderboardTab === 'global'
                      ? 'border-[var(--nba-blue)] text-white font-bold'
                      : 'border-transparent text-[var(--text-secondary)] hover:text-white'
                    }`}
                >
                  Global Leaderboard
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 pr-1">
                {leaderboardTab === 'local' ? (
                  <div className="grid grid-cols-2 gap-4 py-2">
                    <div className="p-4 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)] text-center">
                      <div className="text-[var(--text-secondary)] text-[10px] uppercase font-bold tracking-wider mb-1">Days Won</div>
                      <div className="text-2xl font-bold text-[var(--color-correct)]">{stats.daysWon}</div>
                    </div>
                    <div className="p-4 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)] text-center">
                      <div className="text-[var(--text-secondary)] text-[10px] uppercase font-bold tracking-wider mb-1">Days Lost</div>
                      <div className="text-2xl font-bold text-red-400">{stats.daysLost}</div>
                    </div>
                    <div className="p-4 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)] text-center">
                      <div className="text-[var(--text-secondary)] text-[10px] uppercase font-bold tracking-wider mb-1">Win Rate</div>
                      <div className="text-2xl font-bold text-white">
                        {stats.daysWon + stats.daysLost > 0
                          ? `${Math.round((stats.daysWon / (stats.daysWon + stats.daysLost)) * 100)}%`
                          : '0%'}
                      </div>
                    </div>
                    <div className="p-4 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)] text-center">
                      <div className="text-[var(--text-secondary)] text-[10px] uppercase font-bold tracking-wider mb-1">Avg Guesses (Wins)</div>
                      <div className="text-2xl font-bold text-[var(--gold)]">
                        {stats.daysWon > 0
                          ? (stats.totalGuessesForWins / stats.daysWon).toFixed(2)
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="min-h-[200px]">
                      {leaderboardLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-2">
                          <div className="w-8 h-8 border-2 border-[var(--nba-blue)] border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-[var(--text-secondary)] text-xs">Loading...</span>
                        </div>
                      ) : leaderboardRankings.length === 0 ? (
                        <div className="text-center py-12 text-xs text-[var(--text-secondary)]">
                          No submissions yet.
                        </div>
                      ) : (
                        <div className="overflow-hidden rounded-xl border border-[var(--border-color)]">
                          <table className="w-full text-left border-collapse text-sm">
                            <thead>
                              <tr className="bg-[var(--bg-primary)] text-[var(--text-secondary)] text-[10px] uppercase font-bold border-b border-[var(--border-color)]">
                                <th className="py-2.5 px-4 text-center w-14">Rank</th>
                                <th className="py-2.5 px-4">Player</th>
                                <th className="py-2.5 px-4 text-center w-20">Won</th>
                                <th className="py-2.5 px-4 text-center w-20">Lost</th>
                                <th className="py-2.5 px-4 text-center w-24">Avg Guesses</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)]/50">
                              {leaderboardRankings.map((entry, idx) => {
                                const isUser = entry.username.toLowerCase() === leaderboardUsername.toLowerCase() ||
                                  (localStorage.getItem('nbaDaily_submittedName') === entry.username);
                                let medal = null;
                                if (idx === 0) medal = "🥇";
                                else if (idx === 1) medal = "🥈";
                                else if (idx === 2) medal = "🥉";

                                return (
                                  <tr
                                    key={idx}
                                    className={`hover:bg-[var(--bg-tertiary)] ${isUser ? 'bg-[var(--nba-blue)]/10 font-bold border-l-2 border-l-[var(--nba-blue)]' : ''}`}
                                  >
                                    <td className="py-2.5 px-4 text-center text-xs">
                                      {medal ? medal : idx + 1}
                                    </td>
                                    <td className="py-2.5 px-4 truncate max-w-[120px] font-semibold text-white">
                                      {entry.username}
                                    </td>
                                    <td className="py-2.5 px-4 text-center text-xs text-[var(--color-correct)] font-bold">
                                      {entry.daysWon}
                                    </td>
                                    <td className="py-2.5 px-4 text-center text-xs text-[var(--color-incorrect)]">
                                      {entry.daysLost}
                                    </td>
                                    <td className="py-2.5 px-4 text-center text-xs font-bold text-[var(--gold)]">
                                      {entry.daysWon > 0 ? entry.averageGuesses.toFixed(2) : 'N/A'}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {gameState === 'ended' && (
                      <div className="pt-4 border-t border-[var(--border-color)] space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center text-xs gap-2 text-[var(--text-secondary)]">
                          <span>Today: <span className={guessedPlayers[0]?.Name === targetPlayer?.Name ? 'text-[var(--color-correct)] font-bold' : 'text-[var(--color-incorrect)] font-bold'}>{guessedPlayers[0]?.Name === targetPlayer?.Name ? `WON (${attempts} guesses)` : 'LOST'}</span></span>
                          <span>Record: <span className="text-white font-bold">{stats.daysWon}W - {stats.daysLost}L</span></span>
                        </div>

                        {!submittedDates[dateString] ? (
                          <div className="space-y-2">
                            <p className="text-[10px] text-[var(--gold)] uppercase tracking-wider font-bold">Submit to Global Leaderboard</p>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Enter username..."
                                maxLength={20}
                                value={leaderboardUsername}
                                onChange={(e) => setLeaderboardUsername(e.target.value.replace(/[^a-zA-Z0-9_\-\s]/g, ''))}
                                className="flex-1 py-2 px-3 rounded-lg text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] text-white focus:outline-none focus:border-[var(--text-secondary)] focus:ring-0"
                              />
                              <button
                                onClick={handleScoreSubmit}
                                disabled={!leaderboardUsername.trim() || leaderboardLoading}
                                className="px-4 py-2 bg-[var(--nba-red)] hover:bg-[#a60d24] disabled:bg-[var(--nba-red)]/40 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-colors border border-[var(--nba-red)]"
                              >
                                Submit
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-[var(--text-secondary)] text-center py-2 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] font-semibold">
                            Today's score is submitted!
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="text-center text-xs text-[var(--text-secondary)] font-medium py-8 border-t border-[var(--border-color)]/40 mt-12 max-w-2xl w-full">
        <span>Created by Rayane Hamoudi & Rafay Syed • Headshots via Basketball Reference</span>
      </footer>
    </div>
  );
}

// Inline Arrow Left icon
const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2.5}
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
  </svg>
);

export default NBADailyGame;
