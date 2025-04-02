import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, X, Trophy, Info, Check, ArrowDown, ArrowUp } from 'lucide-react';
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
  easy: { wins: number; losses: number };
  medium: { wins: number; losses: number };
  hard: { wins: number; losses: number };
}

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
    easy: { wins: 0, losses: 0 },
    medium: { wins: 0, losses: 0 },
    hard: { wins: 0, losses: 0 }
  });
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);

  useEffect(() => {
    // Load saved scores from localStorage
    const savedScore = localStorage.getItem('nflTrivia_score');
    if (savedScore) {
      setScore(JSON.parse(savedScore));
    }

    // Load all players for search
    setAllPlayers(playersData.players);
    
    // Load difficulty-specific players for the game
    const difficultyPlayers = {
      easy: easyPlayers.players,
      medium: mediumPlayers.players,
      hard: hardPlayers.players
    };
    setPlayers(difficultyPlayers[difficulty]);
    setTargetPlayer(players[Math.floor(Math.random() * players.length)]);
  }, [difficulty]);

  const handleDifficultySelect = (level: string) => {
    setDifficulty(level as 'easy' | 'medium' | 'hard');
    setGameState('playing');
    // Select random player based on difficulty
    const filteredPlayers = players.filter(player => {
      switch(level) {
        case 'easy':
          return player.MVP >= 2 || player["Super Bowl Wins"] >= 3;
        case 'medium':
          return player.MVP >= 1 || player["Super Bowl Wins"] >= 1;
        case 'hard':
          return player.MVP < 1 && player["Super Bowl Wins"] < 1;
        default:
          return false;
      }
    });
    const randomPlayer = filteredPlayers[Math.floor(Math.random() * filteredPlayers.length)];
    setTargetPlayer(randomPlayer);
  };

  const handleGuess = () => {
    if (!searchQuery || !targetPlayer) return;

    const guessedPlayer = players.find(p => p.Name.toLowerCase() === searchQuery.toLowerCase());
    if (!guessedPlayer) {
      alert('Please select a valid player from the list');
      return;
    }

    setAttempts(prev => prev + 1);
    setGuessedPlayers(prev => [guessedPlayer, ...prev]);
    setSearchQuery('');
    setShowSuggestions(false);

    if (guessedPlayer.Name === targetPlayer.Name || attempts >= 5) {
      const isWin = guessedPlayer.Name === targetPlayer.Name;
      const newScore = {
        ...score,
        [difficulty]: {
          ...score[difficulty as keyof Score],
          [isWin ? 'wins' : 'losses']: score[difficulty as keyof Score][isWin ? 'wins' : 'losses'] + 1
        }
      };
      setScore(newScore);
      localStorage.setItem('nflTrivia_score', JSON.stringify(newScore));
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
    return guessed > target ? 
      <ArrowDown className="w-5 h-5 text-red-500" /> : 
      <ArrowUp className="w-5 h-5 text-red-500" />;
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
    setDifficulty('easy');
    setAttempts(0);
    setTargetPlayer(null);
    setGuessedPlayers([]);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-[#0a0a0a] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/95 to-[#0a0a0a]" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
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
            <ArrowLeft className="w-6 h-6 text-white group-hover:rotate-[-90deg] transition-transform duration-300" />
          </motion.button>
          <motion.h1 
            className="game-title text-5xl bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            NFL HIGHER/LOWER
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
                    <ArrowLeft className="w-6 h-6" />
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
                      }}
                      onKeyPress={handleKeyPress}
                      className="player-input w-full py-3 px-4 pl-12 rounded-xl text-lg bg-white text-black border border-white/20 focus:border-white/40 focus:outline-none transition-colors placeholder:text-gray-500"
                      placeholder="Search for a player..."
                      autoComplete="off"
                    />
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                  </div>
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

              <motion.div 
                className="grid gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {guessedPlayers.map((player, index) => (
                  <motion.div 
                    key={index} 
                    className="player-card p-4 rounded-xl backdrop-blur-sm border border-white/10"
                    variants={itemVariants}
                  >
                    <div className="flex items-center gap-4">
                      <motion.img
                        src={player.imageUrl}
                        alt={player.Name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      />
                      <div className="flex-1">
                        <h3 className="text-white text-xl mb-2">{player.Name}</h3>
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
                ))}
              </motion.div>

              {gameState === 'ended' && (
                <motion.div 
                  className="text-center mt-8"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="text-2xl text-white mb-4">
                    {guessedPlayers[0]?.Name === targetPlayer?.Name ? 'Congratulations!' : 'Game Over!'}
                  </h3>
                  <p className="text-white mb-4">The player was: {targetPlayer?.Name}</p>
                  <motion.button
                    onClick={resetGame}
                    className="bg-white/10 text-white px-8 py-3 rounded-xl text-xl hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/10"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Play Again
                  </motion.button>
                </motion.div>
              )}
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
                  <p className="text-white/80">Guess the mystery NFL player in 6 attempts or less!</p>
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
                  <h2 className="text-2xl font-bold text-white">All-Time Score</h2>
                  <motion.button 
                    onClick={() => setShowScoreModal(false)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="w-6 h-6 text-white" />
                  </motion.button>
                </div>
                <div className="space-y-4">
                  {Object.entries(score).map(([difficulty, stats]) => (
                    <div key={difficulty} className="flex justify-between items-center text-white/80">
                      <span className="text-lg capitalize">{difficulty}</span>
                      <span className="text-lg">
                        Wins: {stats.wins} | Losses: {stats.losses}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NFLGame; 