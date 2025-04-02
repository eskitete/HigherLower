import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, X } from 'lucide-react';
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
}

const NFLGame: React.FC = () => {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [nextPlayer, setNextPlayer] = useState<Player | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);

  useEffect(() => {
    // Load all players for search
    setAllPlayers(playersData.players);
    
    // Load difficulty-specific players for the game
    const difficultyPlayers = {
      easy: easyPlayers.players,
      medium: mediumPlayers.players,
      hard: hardPlayers.players
    };
    setPlayers(difficultyPlayers[difficulty]);
    
    // Select initial players
    const randomIndex = Math.floor(Math.random() * difficultyPlayers[difficulty].length);
    setCurrentPlayer(difficultyPlayers[difficulty][randomIndex]);
    const nextIndex = (randomIndex + 1) % difficultyPlayers[difficulty].length;
    setNextPlayer(difficultyPlayers[difficulty][nextIndex]);
  }, [difficulty]);

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

  const handleHigher = () => {
    if (!currentPlayer || !nextPlayer) return;
    
    const currentValue = getPlayerValue(currentPlayer);
    const nextValue = getPlayerValue(nextPlayer);
    
    if (currentValue < nextValue) {
      setScore(score + 1);
      setCurrentPlayer(nextPlayer);
      const nextIndex = (players.indexOf(nextPlayer) + 1) % players.length;
      setNextPlayer(players[nextIndex]);
    } else {
      setGameOver(true);
    }
  };

  const handleLower = () => {
    if (!currentPlayer || !nextPlayer) return;
    
    const currentValue = getPlayerValue(currentPlayer);
    const nextValue = getPlayerValue(nextPlayer);
    
    if (currentValue > nextValue) {
      setScore(score + 1);
      setCurrentPlayer(nextPlayer);
      const nextIndex = (players.indexOf(nextPlayer) + 1) % players.length;
      setNextPlayer(players[nextIndex]);
    } else {
      setGameOver(true);
    }
  };

  const getPlayerValue = (player: Player): number => {
    switch (difficulty) {
      case 'easy':
        return player["Super Bowl Wins"];
      case 'medium':
        return player.MVP + player["Super Bowl MVP"];
      case 'hard':
        return player.MVP + player["Offensive Player"] + player["Defensive Player"] + 
               player["Offensive Rookie"] + player["Defensive Rookie"] + 
               player["Comeback Player"] + player["Super Bowl MVP"] + 
               player["Super Bowl Wins"];
      default:
        return 0;
    }
  };

  const resetGame = () => {
    setScore(0);
    setGameOver(false);
    const randomIndex = Math.floor(Math.random() * players.length);
    setCurrentPlayer(players[randomIndex]);
    const nextIndex = (randomIndex + 1) % players.length;
    setNextPlayer(players[nextIndex]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
          <div className="flex space-x-4">
            <button
              onClick={() => setDifficulty('easy')}
              className={`px-4 py-2 rounded-lg ${
                difficulty === 'easy' ? 'bg-green-500' : 'bg-gray-700'
              }`}
            >
              Easy
            </button>
            <button
              onClick={() => setDifficulty('medium')}
              className={`px-4 py-2 rounded-lg ${
                difficulty === 'medium' ? 'bg-yellow-500' : 'bg-gray-700'
              }`}
            >
              Medium
            </button>
            <button
              onClick={() => setDifficulty('hard')}
              className={`px-4 py-2 rounded-lg ${
                difficulty === 'hard' ? 'bg-red-500' : 'bg-gray-700'
              }`}
            >
              Hard
            </button>
          </div>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center mb-8"
        >
          NFL HIGHER/LOWER
        </motion.h1>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-2">Score: {score}</h2>
          <p className="text-gray-400">
            {difficulty === 'easy' ? 'Super Bowl Wins' :
             difficulty === 'medium' ? 'MVP + Super Bowl MVP' :
             'All Awards Combined'}
          </p>
        </div>

        {!gameOver ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-4">Current Player</h3>
              <p className="text-2xl font-bold">{currentPlayer?.Name}</p>
              <p className="text-gray-400 mt-2">
                Value: {currentPlayer ? getPlayerValue(currentPlayer) : 0}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-4">Next Player</h3>
              <p className="text-2xl font-bold">{nextPlayer?.Name}</p>
              <p className="text-gray-400 mt-2">
                Value: {nextPlayer ? getPlayerValue(nextPlayer) : 0}
              </p>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-4">Game Over!</h2>
            <p className="text-xl mb-8">Final Score: {score}</p>
            <button
              onClick={resetGame}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              Play Again
            </button>
          </motion.div>
        )}

        {!gameOver && (
          <div className="flex justify-center space-x-4 mt-8">
            <button
              onClick={handleLower}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              Lower
            </button>
            <button
              onClick={handleHigher}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              Higher
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NFLGame; 