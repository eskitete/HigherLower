import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Circle, CircleDot } from 'lucide-react';

interface SportCard {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
}

const sports: SportCard[] = [
  {
    id: 'nba',
    name: 'NBA',
    icon: <Circle className="w-12 h-12" />,
    color: 'text-orange-500',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    id: 'nfl',
    name: 'NFL',
    icon: <Circle className="w-12 h-12" />,
    color: 'text-green-500',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    id: 'soccer',
    name: 'Soccer',
    icon: <Circle className="w-12 h-12" />,
    color: 'text-blue-500',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'ufc',
    name: 'UFC',
    icon: <CircleDot className="w-12 h-12" />,
    color: 'text-red-500',
    gradient: 'from-red-500 to-pink-500'
  },
  {
    id: 'f1',
    name: 'F1',
    icon: <CircleDot className="w-12 h-12" />,
    color: 'text-purple-500',
    gradient: 'from-purple-500 to-indigo-500'
  }
];

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="game-title text-6xl mb-4">SPORTS TRIVIA</h1>
          <p className="text-white/80 text-xl">Select a sport to start playing!</p>
        </header>

        {/* Sport Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sports.map((sport) => (
            <button
              key={sport.id}
              onClick={() => navigate(`/game/${sport.id}`)}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br p-8 transition-all hover:scale-105 hover:shadow-lg"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${sport.gradient} opacity-20 group-hover:opacity-30 transition-opacity`} />
              <div className="relative flex flex-col items-center gap-4">
                <div className={`${sport.color} transition-transform group-hover:scale-110`}>
                  {sport.icon}
                </div>
                <h2 className="text-2xl font-bold text-white">{sport.name}</h2>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home; 