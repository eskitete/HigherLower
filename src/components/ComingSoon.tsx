import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface ComingSoonProps {
  sport: string;
}

function ComingSoon({ sport }: ComingSoonProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="game-title text-5xl">{sport.toUpperCase()} TRIVIA</h1>
        </header>

        {/* Coming Soon Message */}
        <div className="scoreboard rounded-xl p-8 text-center">
          <div className="text-4xl font-bold text-white mb-4">Coming Soon!</div>
          <p className="text-white/80 text-xl mb-8">
            We're working hard to bring you {sport} trivia. Stay tuned for updates!
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-[var(--electric-blue)] text-white px-8 py-3 rounded-lg text-xl hover:bg-opacity-90 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default ComingSoon; 