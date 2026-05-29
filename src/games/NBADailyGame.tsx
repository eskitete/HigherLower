import React, { useState, useEffect } from 'react';
import { Trophy, Info, X, ArrowUp, ArrowDown, Check, Search, Calendar, Timer } from 'lucide-react';
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
    
    // Extract first 5 chars of last name, first 2 chars of first name
    const last = parts[1].replace(/[^a-zA-Z]/g, '').substring(0, 5).toLowerCase();
    const first = parts[0].replace(/[^a-zA-Z]/g, '').substring(0, 2).toLowerCase();
    
    return `https://www.basketball-reference.com/req/202106291/images/headshots/${last}${first}01.jpg`;
  } catch (error) {
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
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
    // Load search index
    setAllPlayers(playersData.players as unknown as Player[]);

    // Determine current local date
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    setDateString(todayStr);

    // Deterministic selection from nba_medium
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

    // Load overall local stats
    const savedStats = localStorage.getItem('nbaDaily_stats');
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (e) {
        console.error("Failed to parse saved stats:", e);
      }
    }

    // Load submitted dates tracker
    const savedSubmissions = localStorage.getItem('nbaDaily_submittedDates');
    if (savedSubmissions) {
      try {
        setSubmittedDates(JSON.parse(savedSubmissions));
      } catch (e) {
        console.error("Failed to parse submitted dates:", e);
      }
    }

    // Restore daily gameplay progress
    const lastPlayedDate = localStorage.getItem('nbaDaily_lastPlayedDate');
    if (lastPlayedDate === todayStr) {
      const savedState = localStorage.getItem('nbaDaily_gameState') as 'playing' | 'ended';
      const savedGuesses = localStorage.getItem('nbaDaily_guessedPlayers');
      const savedAttempts = localStorage.getItem('nbaDaily_attempts');

      if (savedState) setGameState(savedState);
      if (savedGuesses) setGuessedPlayers(JSON.parse(savedGuesses));
      if (savedAttempts) setAttempts(Number(savedAttempts));
    } else {
      // New day, reset current progress
      setGameState('playing');
      setGuessedPlayers([]);
      setAttempts(0);
      localStorage.setItem('nbaDaily_lastPlayedDate', todayStr);
      localStorage.setItem('nbaDaily_gameState', 'playing');
      localStorage.setItem('nbaDaily_guessedPlayers', JSON.stringify([]));
      localStorage.setItem('nbaDaily_attempts', '0');
    }
  }, []);

  // Fetch rankings
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
    const guessesCount = attempts; // attempts has already been incremented on final guess

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

  const handleGuess = () => {
    if (!searchQuery || !targetPlayer || gameState === 'ended') return;

    // Search in all players list
    let guessedPlayer = allPlayers.find(p => p.Name.toLowerCase() === searchQuery.toLowerCase());

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
    setShowSuggestions(false);

    // Save running daily progress
    localStorage.setItem('nbaDaily_attempts', String(newAttempts));
    localStorage.setItem('nbaDaily_guessedPlayers', JSON.stringify(newGuesses));

    if (guessedPlayer.Name === targetPlayer.Name || newAttempts >= 6) {
      setGameState('ended');
      localStorage.setItem('nbaDaily_gameState', 'ended');

      // Update historic daily stats if this day isn't recorded yet
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGuess();
    }
  };

  const compareStats = (stat: keyof Player, guessed: number, target: number | string) => {
    if (typeof target !== 'number') return null;
    if (guessed === target) return <Check className="w-5 h-5 text-green-500" />;
    
    const diff = Math.abs(guessed - target);
    let isClose = false;
    if (stat === 'All-Star' || stat === 'Draft-Year') {
      isClose = diff <= 3;
    } else {
      isClose = diff === 1;
    }
    
    const arrowColor = isClose ? 'text-yellow-500' : 'text-red-500';

    return guessed > target ? 
      <ArrowDown className={`w-5 h-5 ${arrowColor}`} /> : 
      <ArrowUp className={`w-5 h-5 ${arrowColor}`} />;
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
    <div className="min-h-screen py-8 px-4 bg-[#0a0a0a] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/95 to-[#0a0a0a]" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto relative">
        {/* Header */}
        <motion.header 
          className="flex justify-between items-center mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.button
            onClick={() => navigate('/')}
            className="p-2 rounded-full hover:bg-white/10 transition-colors group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowUp className="w-6 h-6 rotate-90 text-white group-hover:rotate-[-90deg] transition-transform duration-300" />
          </motion.button>
          
          <motion.h1 
            className="game-title text-4xl sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 text-center"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            NBA DAILY MODE
          </motion.h1>
          
          <div className="flex gap-3 items-center">
            <button
              onClick={() => navigate('/nba')}
              className="hidden sm:inline-block px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 text-xs font-semibold tracking-wider transition-colors"
            >
              CLASSIC
            </button>
            <motion.button
              onClick={() => setShowModal(true)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Info className="w-6 h-6 text-white" />
            </motion.button>
            <motion.button
              onClick={() => {
                setShowScoreModal(true);
                // Pre-fill username from past submissions
                const pastName = localStorage.getItem('nbaDaily_submittedName') || '';
                setLeaderboardUsername(pastName);
              }}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trophy className="w-6 h-6 text-[var(--gold)]" />
            </motion.button>
          </div>
        </motion.header>

        {/* Small screen Classic Mode switcher */}
        <div className="sm:hidden flex justify-center mb-4">
          <button
            onClick={() => navigate('/nba')}
            className="px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 text-xs font-semibold tracking-wider transition-colors"
          >
            Switch to Classic Mode
          </button>
        </div>

        {/* Main Game Area */}
        <motion.div 
          className="scoreboard rounded-2xl p-6 sm:p-8 mb-8 backdrop-blur-md border border-white/10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="space-y-6">
            <div className="flex justify-between items-center text-white mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-400" />
                <span className="text-lg font-medium">{dateString}</span>
              </div>
              <span className="text-lg">Attempts: {attempts}/6</span>
            </div>

            {gameState === 'playing' && (
              <div className="relative">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      handleSearch(e.target.value);
                      setShowSuggestions(true);
                      setErrorMessage(null);
                    }}
                    onKeyPress={handleKeyPress}
                    className={`player-input w-full py-3 px-4 pl-12 pr-24 sm:pr-32 rounded-xl text-lg bg-white text-black border ${errorMessage ? 'border-red-500' : 'border-white/20'} focus:border-white/40 focus:outline-none transition-colors placeholder:text-gray-500`}
                    placeholder="Search for today's player..."
                    autoComplete="off"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                </div>
                {errorMessage && (
                  <motion.div 
                    className="text-red-500 mt-2 text-sm"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                  >
                    {errorMessage}
                  </motion.div>
                )}
                {showSuggestions && searchResults.length > 0 && (
                  <motion.div 
                    className="absolute z-10 w-full mt-1 bg-white rounded-xl shadow-lg max-h-60 overflow-y-auto border border-gray-200"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {searchResults.map((player) => (
                      <motion.button
                        key={player.Name}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-black"
                        whileHover={{ x: 5 }}
                        onClick={() => {
                          setSearchQuery(player.Name);
                          setShowSuggestions(false);
                        }}
                      >
                        {player.Name}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
                <motion.button 
                  onClick={handleGuess}
                  className="submit-btn absolute right-2 top-1/2 -translate-y-1/2 px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm sm:text-base"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  GUESS
                </motion.button>
              </div>
            )}

            {/* Game Over / Play Again block at the top */}
            {gameState === 'ended' && (
              <motion.div 
                className="text-center mb-8 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-3xl font-bold text-white mb-4">
                  {guessedPlayers[0]?.Name === targetPlayer?.Name ? 'Congratulations!' : 'Game Over!'}
                </h3>
                <p className="text-xl text-white/80 mb-6">
                  {guessedPlayers[0]?.Name === targetPlayer?.Name 
                    ? `You guessed the daily player: ${targetPlayer?.Name}` 
                    : `The daily player was: ${targetPlayer?.Name}`}
                </p>
                
                {/* Countdown timer to next player */}
                <div className="flex flex-col items-center justify-center p-3 bg-white/5 rounded-xl border border-white/5 max-w-sm mx-auto">
                  <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
                    <Timer className="w-4 h-4 text-orange-400" />
                    <span>Next Daily Player in:</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-orange-400">
                    {formatTime(secondsUntilMidnight)}
                  </div>
                </div>

                {!submittedDates[dateString] && (
                  <motion.button
                    onClick={() => {
                      setShowScoreModal(true);
                      setLeaderboardTab('global');
                    }}
                    className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-xl text-lg transition-colors shadow-lg shadow-orange-500/20"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Submit to Daily Leaderboard
                  </motion.button>
                )}
              </motion.div>
            )}

            <motion.div 
              className="grid gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Correct Player Card (if lost) */}
              {gameState === 'ended' && targetPlayer && guessedPlayers[0]?.Name !== targetPlayer.Name && (
                <motion.div 
                  className="player-card incorrect p-4 rounded-xl backdrop-blur-sm"
                  variants={itemVariants}
                >
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    <motion.img
                      src={getPlayerImageUrl(targetPlayer.Name)}
                      alt={targetPlayer.Name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-red-500/20"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    />
                    <div className="flex-1 w-full">
                      <h3 className="text-white text-xl mb-3 text-center sm:text-left">{targetPlayer.Name}</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        {Object.entries(targetPlayer).map(([key, value]) => {
                          if (key === 'Name' || key === 'imageUrl' || value === undefined) return null;
                          return (
                            <div key={key} className="text-center p-2 bg-white/5 rounded-lg border border-white/5 flex flex-col items-center justify-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <span className="stat-value">{value}</span>
                                <span className="inline-block flex items-center justify-center">
                                  <Check className="w-5 h-5 text-green-500" />
                                </span>
                              </div>
                              <div className="text-white/60 text-xs sm:text-sm mt-1 text-center truncate max-w-[120px]">{key}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Guesses list */}
              {guessedPlayers.map((player, index) => {
                const isWinningGuess = gameState === 'ended' && player.Name === targetPlayer?.Name;
                const cardClass = isWinningGuess 
                  ? 'player-card correct p-4 rounded-xl backdrop-blur-sm' 
                  : 'player-card p-4 rounded-xl backdrop-blur-sm';
                  
                return (
                  <motion.div 
                    key={index} 
                    className={cardClass}
                    variants={itemVariants}
                  >
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                      <motion.img
                        src={getPlayerImageUrl(player.Name)}
                        alt={player.Name}
                        className={`w-16 h-16 rounded-full object-cover border-2 ${isWinningGuess ? 'border-green-500/20' : 'border-white/20'}`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      />
                      <div className="flex-1 w-full">
                        <h3 className="text-white text-xl mb-3 text-center sm:text-left">
                          {player.Name}
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                          {Object.entries(player).map(([key, value]) => {
                            if (key === 'Name' || key === 'imageUrl' || value === undefined) return null;
                            const targetValue = targetPlayer?.[key as keyof Player];
                            if (typeof value === 'number' && typeof targetValue === 'number') {
                              return (
                                <div key={key} className="text-center p-2 bg-white/5 rounded-lg border border-white/5 flex flex-col items-center justify-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <span className="stat-value">{value}</span>
                                    <span className="inline-block flex items-center justify-center">
                                      {compareStats(key as keyof Player, value, targetValue)}
                                    </span>
                                  </div>
                                  <div className="text-white/60 text-xs sm:text-sm mt-1 text-center truncate max-w-[120px]">{key}</div>
                                </div>
                              );
                            }
                            return (
                              <div key={key} className="text-center p-2 bg-white/5 rounded-lg border border-white/5 flex flex-col items-center justify-center">
                                <span className="stat-value">{value}</span>
                                <div className="text-white/60 text-xs sm:text-sm mt-1 text-center truncate max-w-[120px]">{key}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </motion.div>

        {/* Info Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div 
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-lg w-full border border-white/10"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-white">How to Play: Daily Mode</h2>
                  <motion.button 
                    onClick={() => setShowModal(false)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="w-6 h-6 text-white" />
                  </motion.button>
                </div>
                <div className="prose prose-invert">
                  <p className="text-white/80">Every day, all players get the exact same player chosen from the NBA medium pool.</p>
                  <ol className="text-white/80">
                    <li>You have exactly 6 attempts to guess the mystery player.</li>
                    <li>You can only play once per calendar day (resetting at midnight local time).</li>
                    <li>Submit your stats to the global leaderboard to compare your average guess count and overall win record with players around the globe!</li>
                  </ol>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Score/Leaderboard Modal */}
        <AnimatePresence>
          {showScoreModal && (
            <motion.div 
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-2xl w-full border border-white/10 shadow-2xl flex flex-col max-h-[85vh]"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Trophy className="w-7 h-7 text-[var(--gold)]" />
                    Daily Mode Scoreboard
                  </h2>
                  <motion.button 
                    onClick={() => setShowScoreModal(false)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10 mb-6">
                  <button
                    onClick={() => setLeaderboardTab('local')}
                    className={`flex-1 pb-3 text-center text-sm font-semibold border-b-2 transition-all ${
                      leaderboardTab === 'local' 
                        ? 'border-orange-500 text-white font-bold' 
                        : 'border-transparent text-white/50 hover:text-white/80'
                    }`}
                  >
                    My Stats
                  </button>
                  <button
                    onClick={() => setLeaderboardTab('global')}
                    className={`flex-1 pb-3 text-center text-sm font-semibold border-b-2 transition-all ${
                      leaderboardTab === 'global' 
                        ? 'border-orange-500 text-white font-bold' 
                        : 'border-transparent text-white/50 hover:text-white/80'
                    }`}
                  >
                    Global Leaderboard
                  </button>
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-y-auto space-y-6 pr-1">
                  {leaderboardTab === 'local' ? (
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                        <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Days Won</div>
                        <div className="text-3xl font-bold text-green-400">{stats.daysWon}</div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                        <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Days Lost</div>
                        <div className="text-3xl font-bold text-red-400">{stats.daysLost}</div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                        <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Win Rate</div>
                        <div className="text-3xl font-bold text-white">
                          {stats.daysWon + stats.daysLost > 0 
                            ? `${Math.round((stats.daysWon / (stats.daysWon + stats.daysLost)) * 100)}%`
                            : '0%'}
                        </div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                        <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Avg Guesses (on Wins)</div>
                        <div className="text-3xl font-bold text-orange-400">
                          {stats.daysWon > 0 
                            ? (stats.totalGuessesForWins / stats.daysWon).toFixed(2)
                            : 'N/A'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Leaderboard Table */}
                      <div className="min-h-[200px]">
                        {leaderboardLoading ? (
                          <div className="flex flex-col items-center justify-center py-12 space-y-3">
                            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-white/60 text-sm">Loading rankings...</span>
                          </div>
                        ) : leaderboardRankings.length === 0 ? (
                          <div className="text-center py-12 text-white/40">
                            No daily rankings submitted yet.
                          </div>
                        ) : (
                          <div className="overflow-hidden rounded-xl border border-white/10">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-white/5 text-white/60 text-xs uppercase tracking-wider border-b border-white/10">
                                  <th className="py-3 px-4 font-semibold w-16 text-center">Rank</th>
                                  <th className="py-3 px-4 font-semibold">Player</th>
                                  <th className="py-3 px-4 font-semibold text-center w-24">Days Won</th>
                                  <th className="py-3 px-4 font-semibold text-center w-24">Days Lost</th>
                                  <th className="py-3 px-4 font-semibold text-center w-28">Avg Guesses</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5 text-white/95">
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
                                      className={`hover:bg-white/5 transition-colors ${isUser ? 'bg-orange-500/10 font-bold border-l-2 border-l-orange-500' : ''}`}
                                    >
                                      <td className="py-3 px-4 text-center">
                                        {medal ? <span className="text-lg">{medal}</span> : idx + 1}
                                      </td>
                                      <td className="py-3 px-4 truncate max-w-[150px]">
                                        {entry.username}
                                      </td>
                                      <td className="py-3 px-4 text-center text-green-400 font-semibold">
                                        {entry.daysWon}
                                      </td>
                                      <td className="py-3 px-4 text-center text-red-400">
                                        {entry.daysLost}
                                      </td>
                                      <td className="py-3 px-4 text-center font-semibold text-orange-400">
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

                      {/* Score Submission Form */}
                      {gameState === 'ended' && (
                        <div className="pt-4 border-t border-white/10 space-y-3">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm gap-2">
                            <span className="text-white/70">Today's Result: <span className={guessedPlayers[0]?.Name === targetPlayer?.Name ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{guessedPlayers[0]?.Name === targetPlayer?.Name ? `WON (in ${attempts} guesses)` : 'LOST'}</span></span>
                            <span className="text-white/70">Your Local Stats: <span className="text-orange-400 font-bold">{stats.daysWon} W - {stats.daysLost} L (Avg: {stats.daysWon > 0 ? (stats.totalGuessesForWins / stats.daysWon).toFixed(2) : 'N/A'})</span></span>
                          </div>
                          
                          {!submittedDates[dateString] ? (
                            <div className="space-y-2">
                              <p className="text-xs text-orange-400 font-medium">Submit your daily score to the global leaderboard:</p>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Enter username..."
                                  maxLength={20}
                                  value={leaderboardUsername}
                                  onChange={(e) => setLeaderboardUsername(e.target.value.replace(/[^a-zA-Z0-9_\-\s]/g, ''))}
                                  className="flex-1 py-2 px-3 rounded-lg text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                                <button
                                  onClick={handleScoreSubmit}
                                  disabled={!leaderboardUsername.trim() || leaderboardLoading}
                                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg shadow transition-colors"
                                >
                                  Submit
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-white/40 text-center py-1 bg-white/5 rounded-lg border border-white/5">
                              Today's daily score has been successfully submitted!
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
      </div>
      
      {/* Footer in bottom left */}
      <div className="absolute bottom-4 left-4 z-10 text-white text-xs font-light select-none flex flex-col gap-0.5">
        <span>Created by Rayane Hamoudi & Rafay Syed</span>
        <span>Images: Basketball Reference</span>
      </div>
    </div>
  );
}

export default NBADailyGame;
