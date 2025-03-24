import React, { useState, useEffect } from 'react';
import { Trophy, Info, X, ArrowUp, ArrowDown, Check } from 'lucide-react';

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
}

interface Score {
  easy: { wins: number; losses: number };
  medium: { wins: number; losses: number };
  hard: { wins: number; losses: number };
}

function App() {
  const [gameState, setGameState] = useState<'selection' | 'playing' | 'ended'>('selection');
  const [difficulty, setDifficulty] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [targetPlayer, setTargetPlayer] = useState<Player | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [guessedPlayers, setGuessedPlayers] = useState<Player[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [score, setScore] = useState<Score>({
    easy: { wins: 0, losses: 0 },
    medium: { wins: 0, losses: 0 },
    hard: { wins: 0, losses: 0 }
  });

  useEffect(() => {
    // Load saved scores from localStorage
    const savedScore = localStorage.getItem('nbaTrivia_score');
    if (savedScore) {
      setScore(JSON.parse(savedScore));
    }

    // Load player data
    fetch('/players.json')
      .then(response => response.json())
      .then(data => setPlayers(data.players))
      .catch(error => console.error('Error loading players:', error));
  }, []);

  const handleDifficultySelect = (level: string) => {
    setDifficulty(level);
    setGameState('playing');
    // Select random player based on difficulty
    const filteredPlayers = players.filter(player => {
      switch(level) {
        case 'easy':
          return player["All-Star"] >= 10;
        case 'medium':
          return player["All-Star"] >= 5 && player["All-Star"] < 10;
        case 'hard':
          return player["All-Star"] < 5;
        default:
          return false;
      }
    });
    const randomPlayer = filteredPlayers[Math.floor(Math.random() * filteredPlayers.length)];
    setTargetPlayer(randomPlayer);
  };

  const handleGuess = () => {
    if (!searchTerm || !targetPlayer) return;

    const guessedPlayer = players.find(p => p.Name.toLowerCase() === searchTerm.toLowerCase());
    if (!guessedPlayer) {
      alert('Please select a valid player from the list');
      return;
    }

    setAttempts(prev => prev + 1);
    setGuessedPlayers(prev => [guessedPlayer, ...prev]);
    setSearchTerm('');
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
      localStorage.setItem('nbaTrivia_score', JSON.stringify(newScore));
      setGameState('ended');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGuess();
    }
  };

  const compareStats = (stat: keyof Player, guessed: number, target: number) => {
    if (guessed === target) return <Check className="w-5 h-5 text-green-500" />;
    return guessed > target ? 
      <ArrowDown className="w-5 h-5 text-red-500" /> : 
      <ArrowUp className="w-5 h-5 text-red-500" />;
  };

  const filteredPlayers = searchTerm
    ? players
        .filter(p => p.Name.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 5)
    : [];

  const resetGame = () => {
    setGameState('selection');
    setDifficulty('');
    setAttempts(0);
    setTargetPlayer(null);
    setGuessedPlayers([]);
    setSearchTerm('');
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="game-title text-5xl">NBA TRIVIA</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setShowModal(true)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <Info className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={() => setShowScoreModal(true)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <Trophy className="w-6 h-6 text-[var(--gold)]" />
            </button>
          </div>
        </header>

        {/* Main Game Area */}
        <div className="scoreboard rounded-xl p-8 mb-8">
          {gameState === 'selection' ? (
            <div className="text-center">
              <h2 className="game-title text-3xl mb-8 text-white">SELECT DIFFICULTY</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => handleDifficultySelect('easy')}
                  className="difficulty-btn bg-green-500 text-white py-4 px-8 rounded-lg text-xl"
                >
                  EASY
                </button>
                <button
                  onClick={() => handleDifficultySelect('medium')}
                  className="difficulty-btn bg-yellow-500 text-white py-4 px-8 rounded-lg text-xl"
                >
                  MEDIUM
                </button>
                <button
                  onClick={() => handleDifficultySelect('hard')}
                  className="difficulty-btn bg-red-500 text-white py-4 px-8 rounded-lg text-xl"
                >
                  HARD
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center text-white mb-6">
                <span className="text-lg">Attempts: {attempts}/6</span>
                <span className="text-lg">Difficulty: {difficulty.toUpperCase()}</span>
              </div>
              
              {gameState === 'playing' && (
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onKeyPress={handleKeyPress}
                    className="player-input w-full py-3 px-4 rounded-lg text-lg"
                    placeholder="Search for a player..."
                    autoComplete="off"
                  />
                  {showSuggestions && filteredPlayers.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredPlayers.map((player) => (
                        <button
                          key={player.Name}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                          onClick={() => {
                            setSearchTerm(player.Name);
                            setShowSuggestions(false);
                          }}
                        >
                          {player.Name}
                        </button>
                      ))}
                    </div>
                  )}
                  <button 
                    onClick={handleGuess}
                    className="submit-btn absolute right-2 top-2 px-6 py-1 rounded-md"
                  >
                    GUESS
                  </button>
                </div>
              )}

              <div className="grid gap-4">
                {guessedPlayers.map((player, index) => (
                  <div key={index} className="player-card p-4 rounded-lg">
                    <div className="flex items-center gap-4">
                      <img
                        src={`https://www.basketball-reference.com/req/202106291/images/headshots/${player.Name.toLowerCase().replace(/[^a-z]/g, '').substring(0, 5)}${player.Name.split(' ')[0].toLowerCase().substring(0, 2)}01.jpg`}
                        alt={player.Name}
                        className="w-16 h-16 rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Player';
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="text-white text-xl mb-2">{player.Name}</h3>
                        <div className="grid grid-cols-4 gap-4">
                          {Object.entries(player).map(([key, value]) => {
                            if (key === 'Name') return null;
                            return (
                              <div key={key} className="text-center">
                                <div className="stat-value">{value}</div>
                                <div className="text-white/60 text-sm">{key}</div>
                                {targetPlayer && (
                                  <div className="mt-1">
                                    {compareStats(key as keyof Player, value, targetPlayer[key as keyof Player])}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {gameState === 'ended' && (
                <div className="text-center mt-8">
                  <h3 className="text-2xl text-white mb-4">
                    {guessedPlayers[0]?.Name === targetPlayer?.Name ? 'Congratulations!' : 'Game Over!'}
                  </h3>
                  <p className="text-white mb-4">The player was: {targetPlayer?.Name}</p>
                  <button
                    onClick={resetGame}
                    className="bg-[var(--electric-blue)] text-white px-8 py-3 rounded-lg text-xl hover:bg-opacity-90 transition-colors"
                  >
                    Play Again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">How to Play</h2>
                <button onClick={() => setShowModal(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="prose">
                <p>Guess the mystery NBA player in 6 attempts or less!</p>
                <ol>
                  <li>Choose your difficulty level</li>
                  <li>Enter your guess in the search box</li>
                  <li>Compare stats with the mystery player</li>
                  <li>Use the arrows as hints:</li>
                  <ul>
                    <li>↑ means the mystery player has a higher value</li>
                    <li>↓ means the mystery player has a lower value</li>
                    <li>✓ means you've matched the exact value</li>
                  </ul>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Score Modal */}
        {showScoreModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">All-Time Score</h2>
                <button onClick={() => setShowScoreModal(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                {Object.entries(score).map(([difficulty, stats]) => (
                  <div key={difficulty} className="flex justify-between items-center">
                    <span className="text-lg capitalize">{difficulty}</span>
                    <span className="text-lg">
                      Wins: {stats.wins} | Losses: {stats.losses}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;