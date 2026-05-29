import React, { useState, useEffect } from 'react';
import { Trophy, Info, X, ArrowUp, ArrowDown, Check, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import playersData from '../../json/nba.json';
import easyPlayers from '../../json/nba_easy.json';
import mediumPlayers from '../../json/nba_medium.json';
import hardPlayers from '../../json/nba_hard.json';

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

interface Score {
  easy: { wins: number; losses: number; currentStreak: number; maxStreak: number };
  medium: { wins: number; losses: number; currentStreak: number; maxStreak: number };
  hard: { wins: number; losses: number; currentStreak: number; maxStreak: number };
}

const getMockLeaderboard = (gameMode: 'nba' | 'nfl', diff: 'easy' | 'medium' | 'hard') => {
  const users = {
    nba: {
      easy: [
        { username: "KingJames23", score: 48, date: "2026-05-12T04:00:00.000Z" },
        { username: "CurryCooking30", score: 42, date: "2026-05-15T04:00:00.000Z" },
        { username: "JokerTripleDouble", score: 35, date: "2026-05-18T04:00:00.000Z" },
        { username: "GreekFreak34", score: 29, date: "2026-05-20T04:00:00.000Z" },
        { username: "KD_EasyMoney", score: 26, date: "2026-05-22T04:00:00.000Z" },
        { username: "LukaMagic77", score: 24, date: "2026-05-23T04:00:00.000Z" },
        { username: "TatumChamps0", score: 19, date: "2026-05-24T04:00:00.000Z" },
        { username: "SGA_MVP", score: 18, date: "2026-05-25T04:00:00.000Z" },
        { username: "AntMan5", score: 15, date: "2026-05-26T04:00:00.000Z" },
        { username: "HaliburtonPass", score: 12, date: "2026-05-28T04:00:00.000Z" }
      ],
      medium: [
        { username: "BookerPoint", score: 22, date: "2026-05-10T04:00:00.000Z" },
        { username: "DameTime", score: 19, date: "2026-05-12T04:00:00.000Z" },
        { username: "AD_Brow", score: 18, date: "2026-05-14T04:00:00.000Z" },
        { username: "KawhiKlaw", score: 14, date: "2026-05-16T04:00:00.000Z" },
        { username: "KAT_3pt", score: 12, date: "2026-05-18T04:00:00.000Z" },
        { username: "JaylenFMVP", score: 11, date: "2026-05-20T04:00:00.000Z" },
        { username: "MitchellSpyda", score: 9, date: "2026-05-21T04:00:00.000Z" },
        { username: "EmbiidProcess", score: 8, date: "2026-05-23T04:00:00.000Z" },
        { username: "GeorgeP13", score: 7, date: "2026-05-25T04:00:00.000Z" },
        { username: "BamBlock", score: 5, date: "2026-05-27T04:00:00.000Z" }
      ],
      hard: [
        { username: "WembyHeight", score: 15, date: "2026-05-09T04:00:00.000Z" },
        { username: "BrunsonBurner", score: 13, date: "2026-05-11T04:00:00.000Z" },
        { username: "EdwardsFlight", score: 11, date: "2026-05-13T04:00:00.000Z" },
        { username: "CunninghamCade", score: 9, date: "2026-05-15T04:00:00.000Z" },
        { username: "MaxeySpeed", score: 8, date: "2026-05-17T04:00:00.000Z" },
        { username: "BarnesScottie", score: 7, date: "2026-05-19T04:00:00.000Z" },
        { username: "FoxClutch", score: 6, date: "2026-05-21T04:00:00.000Z" },
        { username: "SengunPost", score: 5, date: "2026-05-23T04:00:00.000Z" },
        { username: "HolmgrenBlock", score: 4, date: "2026-05-25T04:00:00.000Z" },
        { username: "JalenWilliams8", score: 3, date: "2026-05-27T04:00:00.000Z" }
      ]
    },
    nfl: {
      easy: [
        { username: "MahomesMagic", score: 38, date: "2026-05-10T04:00:00.000Z" },
        { username: "LamarSpeed", score: 31, date: "2026-05-12T04:00:00.000Z" },
        { username: "AllenBuffalo", score: 27, date: "2026-05-14T04:00:00.000Z" },
        { username: "RodgersGreen", score: 22, date: "2026-05-16T04:00:00.000Z" },
        { username: "Stafford9", score: 19, date: "2026-05-18T04:00:00.000Z" },
        { username: "HurtsEagle", score: 16, date: "2026-05-20T04:00:00.000Z" },
        { username: "BurrowJoe", score: 14, date: "2026-05-22T04:00:00.000Z" },
        { username: "GoffLion", score: 11, date: "2026-05-24T04:00:00.000Z" },
        { username: "PurdyNiner", score: 9, date: "2026-05-26T04:00:00.000Z" },
        { username: "LoveJordan", score: 7, date: "2026-05-28T04:00:00.000Z" }
      ],
      medium: [
        { username: "McCaffreyRun", score: 21, date: "2026-05-09T04:00:00.000Z" },
        { username: "GarrettSack", score: 18, date: "2026-05-11T04:00:00.000Z" },
        { username: "BarkleySaquon", score: 15, date: "2026-05-13T04:00:00.000Z" },
        { username: "JeffersonJets", score: 13, date: "2026-05-15T04:00:00.000Z" },
        { username: "HillCheetah", score: 12, date: "2026-05-17T04:00:00.000Z" },
        { username: "CrosbyMaxx", score: 9, date: "2026-05-19T04:00:00.000Z" },
        { username: "WattT.J.", score: 8, date: "2026-05-21T04:00:00.000Z" },
        { username: "WalkerKenneth", score: 7, date: "2026-05-23T04:00:00.000Z" },
        { username: "DiggsStefon", score: 5, date: "2026-05-25T04:00:00.000Z" },
        { username: "KittleGeorge", score: 4, date: "2026-05-27T04:00:00.000Z" }
      ],
      hard: [
        { username: "DanielsJayden", score: 14, date: "2026-05-10T04:00:00.000Z" },
        { username: "JSN_Seahawks", score: 11, date: "2026-05-12T04:00:00.000Z" },
        { username: "SurtainPS2", score: 9, date: "2026-05-14T04:00:00.000Z" },
        { username: "VerseJared", score: 8, date: "2026-05-16T04:00:00.000Z" },
        { username: "McMillanTet", score: 7, date: "2026-05-18T04:00:00.000Z" },
        { username: "SchwesingerC", score: 5, date: "2026-05-20T04:00:00.000Z" },
        { username: "HarrisonMarv", score: 4, date: "2026-05-22T04:00:00.000Z" },
        { username: "NabersMalik", score: 3, date: "2026-05-24T04:00:00.000Z" },
        { username: "BowersBrock", score: 2, date: "2026-05-26T04:00:00.000Z" },
        { username: "WilliamsCaleb", score: 1, date: "2026-05-28T04:00:00.000Z" }
      ]
    }
  };
  return users[gameMode][diff];
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

function NBAGame() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<'selection' | 'playing' | 'ended'>('selection');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [attempts, setAttempts] = useState(0);
  const [targetPlayer, setTargetPlayer] = useState<Player | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [guessedPlayers, setGuessedPlayers] = useState<Player[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [score, setScore] = useState<Score>({
    easy: { wins: 0, losses: 0, currentStreak: 0, maxStreak: 0 },
    medium: { wins: 0, losses: 0, currentStreak: 0, maxStreak: 0 },
    hard: { wins: 0, losses: 0, currentStreak: 0, maxStreak: 0 }
  });
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [leaderboardTab, setLeaderboardTab] = useState<'local' | 'global'>('local');
  const [leaderboardDiff, setLeaderboardDiff] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [leaderboardRankings, setLeaderboardRankings] = useState<{ username: string; score: number; date: string }[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardUsername, setLeaderboardUsername] = useState('');

  // Load saved scores and migrate if needed
  useEffect(() => {
    const savedScore = localStorage.getItem('nbaTrivia_score');
    if (savedScore) {
      try {
        const parsed = JSON.parse(savedScore);
        const migrated = { ...parsed };
        (['easy', 'medium', 'hard'] as const).forEach(diff => {
          if (!migrated[diff]) {
            migrated[diff] = { wins: 0, losses: 0, currentStreak: 0, maxStreak: 0 };
          } else {
            if (migrated[diff].currentStreak === undefined) migrated[diff].currentStreak = 0;
            if (migrated[diff].maxStreak === undefined) migrated[diff].maxStreak = 0;
          }
        });
        setScore(migrated);
        localStorage.setItem('nbaTrivia_score', JSON.stringify(migrated));
      } catch (e) {
        console.error("Failed to parse/migrate scores:", e);
      }
    }
  }, []);

  useEffect(() => {
    // Load all players for search
    setAllPlayers(playersData.players as unknown as Player[]);
    
    // Load difficulty-specific players for the game
    const difficultyPlayers = {
      easy: easyPlayers.players,
      medium: mediumPlayers.players,
      hard: hardPlayers.players
    };
    setPlayers(difficultyPlayers[difficulty]);
    
    // Select random player after players are set
    const currentPlayers = difficultyPlayers[difficulty];
    if (currentPlayers && currentPlayers.length > 0) {
      setTargetPlayer(currentPlayers[Math.floor(Math.random() * currentPlayers.length)]);
    }
  }, [difficulty]);

  // Load leaderboard when difficulty or tab changes
  useEffect(() => {
    if (showScoreModal && leaderboardTab === 'global') {
      fetchLeaderboard(leaderboardDiff);
    }
  }, [showScoreModal, leaderboardTab, leaderboardDiff]);

  const fetchLeaderboard = async (diff: 'easy' | 'medium' | 'hard') => {
    setLeaderboardLoading(true);
    try {
      const res = await fetch(`/.netlify/functions/leaderboard?gameMode=nba&difficulty=${diff}`);
      if (!res.ok) throw new Error("HTTP error " + res.status);
      const data = await res.json();
      setLeaderboardRankings(data);
    } catch (err) {
      console.warn("Using simulated leaderboard fallback:", err);
      const mockData = getMockLeaderboard("nba", diff);
      const localSimulated = localStorage.getItem(`nbaTrivia_simulated_leaderboard_${diff}`);
      if (localSimulated) {
        setLeaderboardRankings(JSON.parse(localSimulated));
      } else {
        setLeaderboardRankings(mockData);
        localStorage.setItem(`nbaTrivia_simulated_leaderboard_${diff}`, JSON.stringify(mockData));
      }
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const handleScoreSubmit = async () => {
    if (!leaderboardUsername.trim()) return;
    const username = leaderboardUsername.trim().substring(0, 20);
    const streakToSubmit = score[leaderboardDiff].maxStreak;

    setLeaderboardLoading(true);
    try {
      const res = await fetch(`/.netlify/functions/leaderboard?gameMode=nba&difficulty=${leaderboardDiff}`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ username, score: streakToSubmit })
      });
      if (!res.ok) throw new Error("HTTP error " + res.status);
      const data = await res.json();
      setLeaderboardRankings(data.scores);
      localStorage.setItem(`nbaTrivia_submitted_max_streak_${leaderboardDiff}`, streakToSubmit.toString());
      localStorage.setItem(`nbaTrivia_submitted_name_${leaderboardDiff}`, username);
    } catch (err) {
      console.warn("Using simulated score submission fallback:", err);
      let list = [];
      const localSimulated = localStorage.getItem(`nbaTrivia_simulated_leaderboard_${leaderboardDiff}`);
      if (localSimulated) {
        list = JSON.parse(localSimulated);
      } else {
        list = getMockLeaderboard("nba", leaderboardDiff);
      }

      const existingIndex = list.findIndex((e: any) => e.username.toLowerCase() === username.toLowerCase());
      if (existingIndex !== -1) {
        if (streakToSubmit > list[existingIndex].score) {
          list[existingIndex].score = streakToSubmit;
          list[existingIndex].date = new Date().toISOString();
        }
      } else {
        list.push({ username, score: streakToSubmit, date: new Date().toISOString() });
      }

      list.sort((a: any, b: any) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
      const updatedList = list.slice(0, 100);

      localStorage.setItem(`nbaTrivia_simulated_leaderboard_${leaderboardDiff}`, JSON.stringify(updatedList));
      setLeaderboardRankings(updatedList);
      localStorage.setItem(`nbaTrivia_submitted_max_streak_${leaderboardDiff}`, streakToSubmit.toString());
      localStorage.setItem(`nbaTrivia_submitted_name_${leaderboardDiff}`, username);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const handleDifficultySelect = (level: string) => {
    setDifficulty(level as 'easy' | 'medium' | 'hard');
    setGameState('playing');
    
    // Get the appropriate difficulty players
    const difficultyPlayers = {
      easy: easyPlayers.players,
      medium: mediumPlayers.players,
      hard: hardPlayers.players
    };
    
    // Set the players for the current difficulty
    const currentPlayers = difficultyPlayers[level as keyof typeof difficultyPlayers];
    setPlayers(currentPlayers);
    
    // Select a random player from the current difficulty
    if (currentPlayers && currentPlayers.length > 0) {
      const randomIndex = Math.floor(Math.random() * currentPlayers.length);
      setTargetPlayer(currentPlayers[randomIndex]);
    }
  };

  const handleGuess = () => {
    if (!searchQuery || !targetPlayer) return;

    // First try to find the player in the current difficulty players
    let guessedPlayer = players.find(p => p.Name.toLowerCase() === searchQuery.toLowerCase());
    
    // If not found, try to find in the main players list
    if (!guessedPlayer) {
      const mainPlayer = (playersData.players as unknown as Player[]).find(p => 
        p.Name.toLowerCase() === searchQuery.toLowerCase()
      );
      
      if (mainPlayer) {
        guessedPlayer = mainPlayer;
      }
    }

    if (!guessedPlayer) {
      setErrorMessage('Please select a valid player from the list');
      return;
    }

    setErrorMessage(null);
    setAttempts(prev => prev + 1);
    setGuessedPlayers(prev => [guessedPlayer, ...prev]);
    setSearchQuery('');
    setShowSuggestions(false);

    if (guessedPlayer.Name === targetPlayer.Name || attempts >= 5) {
      const isWin = guessedPlayer.Name === targetPlayer.Name;
      const currentDiff = difficulty as keyof Score;
      const prevDiffScore = score[currentDiff];
      const newWins = isWin ? prevDiffScore.wins + 1 : prevDiffScore.wins;
      const newLosses = isWin ? prevDiffScore.losses : prevDiffScore.losses + 1;
      const newCurrentStreak = isWin ? prevDiffScore.currentStreak + 1 : 0;
      const newMaxStreak = Math.max(prevDiffScore.maxStreak, newCurrentStreak);

      const newScore = {
        ...score,
        [currentDiff]: {
          wins: newWins,
          losses: newLosses,
          currentStreak: newCurrentStreak,
          maxStreak: newMaxStreak
        }
      };
      setScore(newScore);
      localStorage.setItem('nbaTrivia_score', JSON.stringify(newScore));
      setGameState('ended');
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
    
    // Check if within 2 years for Draft-Year
    const isClose = stat === 'Draft-Year' && Math.abs(guessed - target) <= 2;
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
    
    // Search in all players
    const results = allPlayers.filter(player => 
      player.Name.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(results.slice(0, 5));
  };

  const resetGame = () => {
    setGameState('selection');
    setDifficulty('easy');
    setAttempts(0);
    setTargetPlayer(null);
    setGuessedPlayers([]);
    setSearchQuery('');
    setShowSuggestions(false);
    setErrorMessage(null);
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
            className="game-title text-5xl bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            NBA HIGHER/LOWER
          </motion.h1>
          <div className="flex gap-4">
            <motion.button
              onClick={() => setShowModal(true)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Info className="w-6 h-6 text-white" />
            </motion.button>
            <motion.button
              onClick={() => setShowScoreModal(true)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trophy className="w-6 h-6 text-[var(--gold)]" />
            </motion.button>
          </div>
        </motion.header>

        {/* Main Game Area */}
        <motion.div 
          className="scoreboard rounded-2xl p-8 mb-8 backdrop-blur-md border border-white/10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {gameState === 'selection' ? (
            <div className="text-center">
              <motion.h2 
                className="game-title text-3xl mb-8 text-white"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                SELECT DIFFICULTY
              </motion.h2>
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.button
                  onClick={() => handleDifficultySelect('easy')}
                  className="difficulty-btn bg-green-500/20 text-white py-4 px-8 rounded-xl text-xl backdrop-blur-sm border border-green-500/30 hover:bg-green-500/30 transition-colors"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  EASY
                </motion.button>
                <motion.button
                  onClick={() => handleDifficultySelect('medium')}
                  className="difficulty-btn bg-yellow-500/20 text-white py-4 px-8 rounded-xl text-xl backdrop-blur-sm border border-yellow-500/30 hover:bg-yellow-500/30 transition-colors"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  MEDIUM
                </motion.button>
                <motion.button
                  onClick={() => handleDifficultySelect('hard')}
                  className="difficulty-btn bg-red-500/20 text-white py-4 px-8 rounded-xl text-xl backdrop-blur-sm border border-red-500/30 hover:bg-red-500/30 transition-colors"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  HARD
                </motion.button>
              </motion.div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center text-white mb-6">
                <div className="flex items-center gap-4">
                  <motion.button
                    onClick={resetGame}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowUp className="w-6 h-6 rotate-90" />
                  </motion.button>
                  <span className="text-lg">Attempts: {attempts}/6</span>
                </div>
                <span className="text-lg capitalize">{difficulty}</span>
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
                      className={`player-input w-full py-3 px-4 pl-12 rounded-xl text-lg bg-white text-black border ${errorMessage ? 'border-red-500' : 'border-white/20'} focus:border-white/40 focus:outline-none transition-colors placeholder:text-gray-500`}
                      placeholder="Search for a player..."
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
                    className="submit-btn absolute right-2 top-2 px-6 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
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
                      ? `You guessed the correct player: ${targetPlayer?.Name}` 
                      : `The player was: ${targetPlayer?.Name}`}
                  </p>
                  <motion.button
                    onClick={resetGame}
                    className="bg-white text-black font-semibold px-8 py-3 rounded-xl text-xl hover:bg-white/90 transition-colors shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Play Again
                  </motion.button>
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
                    <div className="flex items-center gap-4">
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
                      <div className="flex-1">
                        <h3 className="text-white text-xl mb-2">{targetPlayer.Name} (Correct Player)</h3>
                        <div className="grid grid-cols-4 gap-4">
                          {Object.entries(targetPlayer).map(([key, value]) => {
                            if (key === 'Name' || key === 'imageUrl' || value === undefined) return null;
                            return (
                              <div key={key} className="text-center">
                                <div className="stat-value">{value}</div>
                                <div className="text-white/60 text-sm flex items-center justify-center gap-1">
                                  {key}
                                  <div className="inline-block">
                                    <Check className="w-5 h-5 text-green-500" />
                                  </div>
                                </div>
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
                      <div className="flex items-center gap-4">
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
                        <div className="flex-1">
                          <h3 className="text-white text-xl mb-2">
                            {player.Name} {isWinningGuess && '(Correct)'}
                          </h3>
                          <div className="grid grid-cols-4 gap-4">
                            {Object.entries(player).map(([key, value]) => {
                              if (key === 'Name' || key === 'imageUrl' || value === undefined) return null;
                              const targetValue = targetPlayer?.[key as keyof Player];
                              if (typeof value === 'number' && typeof targetValue === 'number') {
                                return (
                                  <div key={key} className="text-center">
                                    <div className="stat-value">{value}</div>
                                    <div className="text-white/60 text-sm flex items-center justify-center gap-1">
                                      {key}
                                      <div className="inline-block">
                                        {compareStats(key as keyof Player, value, targetValue)}
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                              return (
                                <div key={key} className="text-center">
                                  <div className="stat-value">{value}</div>
                                  <div className="text-white/60 text-sm">{key}</div>
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
          )}
        </motion.div>

        {/* Info Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div 
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm"
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
                  <h2 className="text-2xl font-bold text-white">How to Play</h2>
                  <motion.button 
                    onClick={() => setShowModal(false)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="w-6 h-6 text-white" />
                  </motion.button>
                </div>
                <div className="prose prose-invert">
                  <p className="text-white/80">Guess the mystery NBA player in 6 attempts or less!</p>
                  <ol className="text-white/80">
                    <li>Choose your difficulty level</li>
                    <li>Enter your guess in the search box</li>
                    <li>Compare stats with the mystery player</li>
                    <li>Use the arrows as hints:
                      <ul>
                        <li>↑ means the mystery player has a higher value</li>
                        <li>↓ means the mystery player has a lower value</li>
                        <li>✓ means you've matched the exact value</li>
                      </ul>
                    </li>
                  </ol>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Score Modal */}
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
                    Scoreboard & Rankings
                  </h2>
                  <motion.button 
                    onClick={() => {
                      setShowScoreModal(false);
                      setLeaderboardUsername('');
                    }}
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
                    className={`flex-1 py-3 text-lg font-semibold border-b-2 transition-all ${
                      leaderboardTab === 'local' 
                        ? 'border-orange-500 text-white' 
                        : 'border-transparent text-white/50 hover:text-white/80'
                    }`}
                  >
                    My Stats
                  </button>
                  <button
                    onClick={() => setLeaderboardTab('global')}
                    className={`flex-1 py-3 text-lg font-semibold border-b-2 transition-all ${
                      leaderboardTab === 'global' 
                        ? 'border-orange-500 text-white' 
                        : 'border-transparent text-white/50 hover:text-white/80'
                    }`}
                  >
                    Global Leaderboards
                  </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto pr-1">
                  {leaderboardTab === 'local' ? (
                    <div className="space-y-4">
                      {Object.entries(score).map(([diff, stats]) => (
                        <div key={diff} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xl font-bold capitalize text-white">{diff}</span>
                            <span className="text-sm px-3 py-1 rounded-full bg-white/10 text-white/70">
                              Wins: {stats.wins} | Losses: {stats.losses}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="text-center p-2 bg-white/5 rounded-lg">
                              <div className="text-2xl font-bold text-orange-400">{stats.currentStreak}</div>
                              <div className="text-xs text-white/50 uppercase tracking-wider">Current Streak</div>
                            </div>
                            <div className="text-center p-2 bg-white/5 rounded-lg">
                              <div className="text-2xl font-bold text-[var(--gold)]">{stats.maxStreak}</div>
                              <div className="text-xs text-white/50 uppercase tracking-wider">Max Streak</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Difficulty Selector within Leaderboard */}
                      <div className="flex gap-2">
                        {(['easy', 'medium', 'hard'] as const).map((diff) => (
                          <button
                            key={diff}
                            onClick={() => setLeaderboardDiff(diff)}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium capitalize transition-all ${
                              leaderboardDiff === diff
                                ? 'bg-orange-500 text-white shadow-lg'
                                : 'bg-white/5 text-white/70 hover:bg-white/10'
                            }`}
                          >
                            {diff}
                          </button>
                        ))}
                      </div>

                      {/* Leaderboard Table */}
                      <div className="min-h-[200px]">
                        {leaderboardLoading ? (
                          <div className="flex flex-col items-center justify-center py-12 space-y-3">
                            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-white/60 text-sm">Loading rankings...</span>
                          </div>
                        ) : leaderboardRankings.length === 0 ? (
                          <div className="text-center py-12 text-white/40">
                            No rankings submitted yet for this difficulty.
                          </div>
                        ) : (
                          <div className="overflow-hidden rounded-xl border border-white/10">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-white/5 text-white/60 text-xs uppercase tracking-wider border-b border-white/10">
                                  <th className="py-3 px-4 font-semibold w-16 text-center">Rank</th>
                                  <th className="py-3 px-4 font-semibold">Player</th>
                                  <th className="py-3 px-4 font-semibold text-center w-28">Max Streak</th>
                                  <th className="py-3 px-4 font-semibold text-right">Date</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5 text-white/95">
                                {leaderboardRankings.map((entry, idx) => {
                                  const isUser = entry.username.toLowerCase() === leaderboardUsername.toLowerCase() || 
                                    (localStorage.getItem(`nbaTrivia_submitted_name_${leaderboardDiff}`) === entry.username);
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
                                      <td className="py-3 px-4 text-center font-semibold text-orange-400">
                                        {entry.score}
                                      </td>
                                      <td className="py-3 px-4 text-right text-xs text-white/40">
                                        {new Date(entry.date).toLocaleDateString()}
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
                      {score[leaderboardDiff].maxStreak > 0 && (
                        <div className="pt-4 border-t border-white/10 space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-white/70">Your Local Max Streak:</span>
                            <span className="text-orange-400 font-bold text-base">{score[leaderboardDiff].maxStreak}</span>
                          </div>
                          
                          {Number(localStorage.getItem(`nbaTrivia_submitted_max_streak_${leaderboardDiff}`) || 0) < score[leaderboardDiff].maxStreak ? (
                            <div className="space-y-2">
                              <p className="text-xs text-green-400 font-medium">New high score! Submit your streak to the global leaderboard:</p>
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
                            <p className="text-xs text-white/40 text-center py-1">
                              Your high score of {score[leaderboardDiff].maxStreak} has been successfully submitted!
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

export default NBAGame; 