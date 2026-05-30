import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Trophy, Info, Check, ArrowDown, ArrowUp, RotateCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import playersData from '../../json/nfl.json';
import easyPlayers from '../../json/nfl_easy.json';
import mediumPlayers from '../../json/nfl_medium.json';
import hardPlayers from '../../json/nfl_hard.json';

interface Player {
  Name: string;
  MVP: number;
  "Offensive Player": number;
  "Defensive Player": number;
  "Offensive Rookie": number;
  "Defensive Rookie": number;
  "Comeback Player": number;
  "Super Bowl MVP": number;
  "Super Bowl Wins": number;
  imageUrl?: string;
}

interface Score {
  easy: { wins: number; losses: number; currentStreak: number; maxStreak: number };
  medium: { wins: number; losses: number; currentStreak: number; maxStreak: number };
  hard: { wins: number; losses: number; currentStreak: number; maxStreak: number };
}

interface LeaderboardEntry {
  username: string;
  wins: number;
  losses: number;
  date: string;
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
  return users[gameMode][diff].map(u => ({
    username: u.username,
    wins: u.score,
    losses: Math.round(u.score * 0.15) + 2,
    date: u.date
  }));
};

const NFL_STATS_KEYS: (keyof Player)[] = [
  'Super Bowl Wins',
  'Super Bowl MVP',
  'MVP',
  'Offensive Player',
  'Defensive Player',
  'Offensive Rookie',
  'Defensive Rookie',
  'Comeback Player'
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

const NFLGame: React.FC = () => {
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
  const [leaderboardRankings, setLeaderboardRankings] = useState<{ username: string; wins: number; losses: number; date: string }[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardUsername, setLeaderboardUsername] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(0);

  useEffect(() => {
    setActiveSuggestionIndex(0);
  }, [searchResults]);

  // Load saved scores and migrate if needed
  useEffect(() => {
    const savedScore = localStorage.getItem('nflTrivia_score');
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
        localStorage.setItem('nflTrivia_score', JSON.stringify(migrated));
      } catch (e) {
        console.error("Failed to parse/migrate scores:", e);
      }
    }
  }, []);

  useEffect(() => {
    setAllPlayers(playersData.players as unknown as Player[]);

    const difficultyPlayers = {
      easy: easyPlayers.players,
      medium: mediumPlayers.players,
      hard: hardPlayers.players
    };
    setPlayers(difficultyPlayers[difficulty] as unknown as Player[]);

    const currentPlayers = difficultyPlayers[difficulty];
    if (currentPlayers && currentPlayers.length > 0) {
      setTargetPlayer(currentPlayers[Math.floor(Math.random() * currentPlayers.length)] as unknown as Player);
    }
  }, [difficulty]);

  useEffect(() => {
    if (showScoreModal && leaderboardTab === 'global') {
      fetchLeaderboard(leaderboardDiff);
    }
  }, [showScoreModal, leaderboardTab, leaderboardDiff]);

  const fetchLeaderboard = async (diff: 'easy' | 'medium' | 'hard') => {
    setLeaderboardLoading(true);
    try {
      const res = await fetch(`/.netlify/functions/leaderboard?gameMode=nfl&difficulty=${diff}`);
      if (!res.ok) throw new Error("HTTP error " + res.status);
      const data = await res.json();
      setLeaderboardRankings(data);
    } catch (err) {
      console.warn("Using simulated leaderboard fallback:", err);
      const mockData = getMockLeaderboard("nfl", diff);
      const localSimulated = localStorage.getItem(`nflTrivia_simulated_leaderboard_${diff}`);
      if (localSimulated) {
        setLeaderboardRankings(JSON.parse(localSimulated));
      } else {
        setLeaderboardRankings(mockData);
        localStorage.setItem(`nflTrivia_simulated_leaderboard_${diff}`, JSON.stringify(mockData));
      }
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const handleScoreSubmit = async () => {
    if (!leaderboardUsername.trim()) return;
    const username = leaderboardUsername.trim().substring(0, 20);
    const winsToSubmit = score[leaderboardDiff].wins;
    const lossesToSubmit = score[leaderboardDiff].losses;

    setLeaderboardLoading(true);
    try {
      const res = await fetch(`/.netlify/functions/leaderboard?gameMode=nfl&difficulty=${leaderboardDiff}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, wins: winsToSubmit, losses: lossesToSubmit })
      });
      if (!res.ok) throw new Error("HTTP error " + res.status);
      const data = await res.json();
      setLeaderboardRankings(data.scores);
      localStorage.setItem(`nflTrivia_submitted_wins_${leaderboardDiff}`, winsToSubmit.toString());
      localStorage.setItem(`nflTrivia_submitted_losses_${leaderboardDiff}`, lossesToSubmit.toString());
      localStorage.setItem(`nflTrivia_submitted_name_${leaderboardDiff}`, username);
    } catch (err) {
      console.warn("Using simulated score submission fallback:", err);
      let list: LeaderboardEntry[] = [];
      const localSimulated = localStorage.getItem(`nflTrivia_simulated_leaderboard_${leaderboardDiff}`);
      if (localSimulated) {
        list = JSON.parse(localSimulated);
      } else {
        list = getMockLeaderboard("nfl", leaderboardDiff);
      }

      const existingIndex = list.findIndex((e) => e.username.toLowerCase() === username.toLowerCase());
      if (existingIndex !== -1) {
        const existing = list[existingIndex];
        if (winsToSubmit > existing.wins || (winsToSubmit === existing.wins && lossesToSubmit < existing.losses)) {
          existing.wins = winsToSubmit;
          existing.losses = lossesToSubmit;
          existing.date = new Date().toISOString();
        }
      } else {
        list.push({ username, wins: winsToSubmit, losses: lossesToSubmit, date: new Date().toISOString() });
      }

      list.sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        if (a.losses !== b.losses) return a.losses - b.losses;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
      const updatedList = list.slice(0, 100);

      localStorage.setItem(`nflTrivia_simulated_leaderboard_${leaderboardDiff}`, JSON.stringify(updatedList));
      setLeaderboardRankings(updatedList);
      localStorage.setItem(`nflTrivia_submitted_wins_${leaderboardDiff}`, winsToSubmit.toString());
      localStorage.setItem(`nflTrivia_submitted_losses_${leaderboardDiff}`, lossesToSubmit.toString());
      localStorage.setItem(`nflTrivia_submitted_name_${leaderboardDiff}`, username);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const handleDifficultySelect = (level: string) => {
    const diffSelected = level as 'easy' | 'medium' | 'hard';
    setDifficulty(diffSelected);
    setGameState('playing');

    const difficultyPlayers = {
      easy: easyPlayers.players,
      medium: mediumPlayers.players,
      hard: hardPlayers.players
    };

    const currentPlayers = difficultyPlayers[diffSelected];
    setPlayers(currentPlayers as unknown as Player[]);

    if (currentPlayers && currentPlayers.length > 0) {
      const randomIndex = Math.floor(Math.random() * currentPlayers.length);
      setTargetPlayer(currentPlayers[randomIndex] as unknown as Player);
    }
  };

  const handleGuess = (playerToGuess?: Player) => {
    const query = playerToGuess ? playerToGuess.Name : searchQuery;
    if (!query || !targetPlayer) return;

    let guessedPlayer = playerToGuess || players.find(p => p.Name.toLowerCase() === query.toLowerCase());

    if (!guessedPlayer) {
      const mainPlayer = allPlayers.find(p =>
        p.Name.toLowerCase() === query.toLowerCase()
      );
      if (mainPlayer) {
        guessedPlayer = mainPlayer;
      }
    }

    // Auto-select/fill top name if no exact match but suggestions exist
    if (!guessedPlayer && searchResults.length > 0) {
      const topMatch = searchResults[0];
      guessedPlayer = players.find(p => p.Name.toLowerCase() === topMatch.Name.toLowerCase()) ||
                      allPlayers.find(p => p.Name.toLowerCase() === topMatch.Name.toLowerCase());
    }

    if (!guessedPlayer) {
      setErrorMessage('Please select a valid player from the list');
      return;
    }

    setErrorMessage(null);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setGuessedPlayers(prev => [guessedPlayer!, ...prev]);
    setSearchQuery('');
    setSearchResults([]);
    setShowSuggestions(false);
    setActiveSuggestionIndex(0);

    // Focus the text box for the next guess
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    if (guessedPlayer.Name === targetPlayer.Name || newAttempts >= 6) {
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
      localStorage.setItem('nflTrivia_score', JSON.stringify(newScore));
      setGameState('ended');
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
    if (stat === 'Offensive Rookie' || stat === 'Defensive Rookie') return 'incorrect';
    const diff = Math.abs(guessed - target);
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

  const resetGame = () => {
    setGameState('selection');
    setAttempts(0);
    setTargetPlayer(null);
    setGuessedPlayers([]);
    setSearchQuery('');
    setShowSuggestions(false);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-[var(--bg-primary)] text-white flex flex-col items-center">
      <div className="max-w-2xl w-full">
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
              NFL CLASSIC
            </h1>
            <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider font-semibold">
              Higher / Lower Stat Game
            </p>
          </div>

          <div className="flex-1 flex justify-end gap-2">
            <motion.button
              onClick={() => setShowModal(true)}
              className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)] transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Info className="w-5 h-5 text-[var(--text-secondary)] hover:text-white" />
            </motion.button>
            <motion.button
              onClick={() => setShowScoreModal(true)}
              className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)] transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Trophy className="w-5 h-5 text-[var(--text-secondary)] hover:text-[#fdb927]" />
            </motion.button>
          </div>
        </motion.header>

        {gameState === 'selection' ? (
          <div className="text-center py-8">
            <motion.h2
              className="game-title text-2xl mb-8 text-white font-bold"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              Select Difficulty
            </motion.h2>
            <motion.div
              className="flex flex-col gap-4 max-w-sm mx-auto"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.button
                onClick={() => handleDifficultySelect('easy')}
                className="py-4 px-8 rounded-xl bg-[#1a1a1b] text-green-500 font-bold border border-[#2f3032] hover:border-green-500/50 transition-colors uppercase tracking-wider"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Easy
              </motion.button>
              <motion.button
                onClick={() => handleDifficultySelect('medium')}
                className="py-4 px-8 rounded-xl bg-[#1a1a1b] text-[#fdb927] font-bold border border-[#2f3032] hover:border-[#fdb927]/50 transition-colors uppercase tracking-wider"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Medium
              </motion.button>
              <motion.button
                onClick={() => handleDifficultySelect('hard')}
                className="py-4 px-8 rounded-xl bg-[#1a1a1b] text-red-500 font-bold border border-[#2f3032] hover:border-red-500/50 transition-colors uppercase tracking-wider"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Hard
              </motion.button>
            </motion.div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top switcher and Attempts info */}
            <div className="flex justify-between items-center text-sm">
              <button
                onClick={resetGame}
                className="text-xs text-[var(--text-secondary)] hover:text-white font-bold tracking-wider uppercase border border-[var(--border-color)] px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)]"
              >
                Change Difficulty
              </button>
              <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                <span>Difficulty: <span className="text-white">{difficulty}</span></span>
                <span>Guesses: {attempts} / 6</span>
              </div>
            </div>

            {/* Input Guesser Block */}
            {gameState === 'playing' && (
              <motion.div
                className="relative z-40"
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
                    placeholder="Search for a player..."
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
                  <div className="absolute z-50 w-full mt-1 bg-[var(--bg-secondary)]/85 backdrop-blur-md rounded-xl shadow-2xl border border-[var(--border-color)] max-h-60 overflow-y-auto">
                    {searchResults.map((player, index) => (
                      <button
                        key={player.Name}
                        className={`w-full text-left px-4 py-3 transition-colors text-white font-medium text-sm ${
                          index === activeSuggestionIndex
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

            {/* End Game Info Block */}
            {gameState === 'ended' && targetPlayer && (
              <motion.div
                className="p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-center"
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
                <button
                  onClick={resetGame}
                  className="px-6 py-2.5 rounded-lg bg-[var(--nba-blue)] hover:bg-[#15346e] text-white text-xs font-bold uppercase tracking-wider transition-colors border border-[var(--nba-blue)]"
                >
                  Play Again
                </button>
              </motion.div>
            )}

            {/* Guesses Matrix Grid */}
            <div className="space-y-6">
              {/* Correct Target Player Card if game ended and user lost */}
              {gameState === 'ended' && targetPlayer && guessedPlayers[0]?.Name !== targetPlayer.Name && (
                <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/10">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={targetPlayer.imageUrl || '/placeholder.svg'}
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
                    {NFL_STATS_KEYS.map((key) => {
                      const val = targetPlayer[key];
                      const displayKey = key === 'Super Bowl Wins' ? 'SB Wins' : key === 'Super Bowl MVP' ? 'SB MVP' : key === 'Offensive Player' ? 'Off POY' : key === 'Defensive Player' ? 'Def POY' : key === 'Offensive Rookie' ? 'Off ROY' : key === 'Defensive Rookie' ? 'Def ROY' : key === 'Comeback Player' ? 'CB POY' : key;
                      return (
                        <div key={key} className="stat-tile correct">
                          <span className="text-[10px] uppercase font-bold text-white/80 select-none text-center truncate w-full px-1">{displayKey}</span>
                          <span className="stat-value text-white">{val}</span>
                          <span className="text-[10px] font-bold text-white/80 select-none">✓</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Guesses */}
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
                          src={player.imageUrl || '/placeholder.svg'}
                          alt={player.Name}
                          className={`w-9 h-9 rounded-full object-cover border ${isWin ? 'border-[var(--color-correct)]' : 'border-[var(--border-color)]'}`}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                        <h4 className="font-bold text-white text-base leading-tight">{player.Name}</h4>
                      </div>

                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                        {NFL_STATS_KEYS.map((key, statIdx) => {
                          const guessedVal = player[key] as number;
                          const targetVal = targetPlayer ? (targetPlayer[key] as number) : 0;
                          const status = targetPlayer ? getStatStatus(key, guessedVal, targetVal) : 'incorrect';
                          const displayKey = key === 'Super Bowl Wins' ? 'SB Wins' : key === 'Super Bowl MVP' ? 'SB MVP' : key === 'Offensive Player' ? 'Off POY' : key === 'Defensive Player' ? 'Def POY' : key === 'Offensive Rookie' ? 'Off ROY' : key === 'Defensive Rookie' ? 'Def ROY' : key === 'Comeback Player' ? 'CB POY' : key;

                          return (
                            <motion.div
                              key={key}
                              custom={statIdx}
                              variants={tileVariants}
                              className={`stat-tile ${status}`}
                            >
                              <span className="text-[10px] uppercase font-bold opacity-70 select-none text-center truncate w-full px-1">{displayKey}</span>
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
        )}
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
              <h2 className="text-xl font-bold text-white mb-4">How to Play: Classic Mode</h2>
              <div className="space-y-3 text-sm text-[var(--text-secondary)] leading-relaxed">
                <p>Guess the mystery NFL player in 6 attempts. You can choose from three difficulties:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><span className="text-white font-semibold">Easy</span>: Modern NFL superstars</li>
                  <li><span className="text-white font-semibold">Medium</span>: NFL award winners</li>
                  <li><span className="text-white font-semibold">Hard</span>: Full historical player pool</li>
                </ul>
                <p>After each guess, the tiles will change colors depending on how close your stats are to the target player:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><span className="text-white font-bold bg-[var(--color-correct)] px-1.5 py-0.5 rounded text-xs mr-1">Blue</span> is a perfect match.</li>
                  <li><span className="text-[#0a0d14] font-bold bg-[var(--color-close)] px-1.5 py-0.5 rounded text-xs mr-1">White</span> is a close match (within 1 award of target).</li>
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
                Classic Statistics
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
                  <div className="space-y-4">
                    {Object.entries(score).map(([diff, stats]) => (
                      <div key={diff} className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-base font-bold capitalize text-white">{diff} Mode</span>
                          <span className="text-xs text-[var(--text-secondary)]">
                            Record: {stats.wins} W - {stats.losses} L
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-1">
                          <div className="text-center p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                            <div className="text-xl font-bold text-[var(--color-correct)]">{stats.currentStreak}</div>
                            <div className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-wider">Current Streak</div>
                          </div>
                          <div className="text-center p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                            <div className="text-xl font-bold text-[var(--gold)]">{stats.maxStreak}</div>
                            <div className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-wider">Max Streak</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Difficulty selector for leaderboard */}
                    <div className="flex gap-2 items-center">
                      <div className="flex-1 flex gap-2">
                        {(['easy', 'medium', 'hard'] as const).map((diff) => (
                          <button
                            key={diff}
                            onClick={() => setLeaderboardDiff(diff)}
                            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider border transition-all ${leaderboardDiff === diff
                                ? 'bg-[var(--nba-blue)] text-white border-[var(--nba-blue)]'
                                : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-white border-[var(--border-color)]'
                              }`}
                          >
                            {diff}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => fetchLeaderboard(leaderboardDiff)}
                        disabled={leaderboardLoading}
                        className="flex items-center justify-center p-2 rounded-lg bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Refresh leaderboard"
                      >
                        <RotateCw className={`w-4 h-4 ${leaderboardLoading ? 'animate-spin' : ''}`} />
                      </button>
                    </div>

                    <div className="min-h-[200px]">
                      {leaderboardLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-2">
                          <div className="w-8 h-8 border-2 border-[var(--nba-blue)] border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-[var(--text-secondary)] text-xs">Loading...</span>
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
                                <th className="py-2.5 px-4 text-right">Date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)]/50">
                              {leaderboardRankings.map((entry, idx) => {
                                const isUser = entry.username.toLowerCase() === leaderboardUsername.toLowerCase() ||
                                  (localStorage.getItem(`nflTrivia_submitted_name_${leaderboardDiff}`) === entry.username);
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
                                    <td className="py-2.5 px-4 truncate max-w-[150px] font-semibold text-white">
                                      {entry.username}
                                    </td>
                                    <td className="py-2.5 px-4 text-center text-xs text-[var(--color-correct)] font-bold">
                                      {entry.wins}
                                    </td>
                                    <td className="py-2.5 px-4 text-center text-xs text-[var(--color-incorrect)] font-bold">
                                      {entry.losses}
                                    </td>
                                    <td className="py-2.5 px-4 text-right text-xs text-[var(--text-secondary)]">
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

                    {score[leaderboardDiff].wins > 0 && (
                      <div className="pt-4 border-t border-[var(--border-color)] space-y-4">
                        <div className="flex justify-between items-center text-xs text-[var(--text-secondary)]">
                          <span>Your Record ({leaderboardDiff}):</span>
                          <span className="text-white font-bold text-sm">{score[leaderboardDiff].wins} W - {score[leaderboardDiff].losses} L</span>
                        </div>

                        {Number(localStorage.getItem(`nflTrivia_submitted_wins_${leaderboardDiff}`) || 0) < score[leaderboardDiff].wins ? (
                          <div className="space-y-2">
                            <p className="text-[10px] text-[var(--gold)] uppercase tracking-wider font-bold">Submit New Record</p>
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
                            Record of {score[leaderboardDiff].wins} W - {score[leaderboardDiff].losses} L has been submitted!
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
        <span>Created by Rayane Hamoudi & Rafay Syed • Stats via Pro Football Reference</span>
      </footer>
    </div>
  );
};

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

export default NFLGame;