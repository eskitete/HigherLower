import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dribbble, Trophy, Shield, Flame, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface SportCard {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
}

const sports: SportCard[] = [
  {
    id: 'nba',
    name: 'NBA',
    subtitle: 'Classic & Daily player guessing',
    icon: <Dribbble className="w-6 h-6 text-[#fdb927]" />
  },
  {
    id: 'nfl',
    name: 'NFL',
    subtitle: '',
    icon: <Trophy className="w-6 h-6 text-green-500" />
  },
  {
    id: 'soccer',
    name: 'Soccer',
    subtitle: '',
    icon: <Shield className="w-6 h-6 text-blue-500" />
  },
  {
    id: 'ufc',
    name: 'UFC',
    subtitle: '',
    icon: <Flame className="w-6 h-6 text-red-500" />
  },
  {
    id: 'f1',
    name: 'F1',
    subtitle: '',
    icon: <Activity className="w-6 h-6 text-purple-500" />
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen py-12 px-4 bg-[var(--bg-primary)] flex flex-col justify-between">
      {/* Main Section */}
      <div className="max-w-2xl w-full mx-auto">
        {/* Header */}
        <motion.header
          className="text-center border-b border-[var(--border-color)] pb-6 mb-10"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="game-title text-4xl sm:text-5xl font-extrabold tracking-wider text-white">
            SPORTS GUESSER
          </h1>
          <p className="text-[var(--text-secondary)] text-xs sm:text-sm font-semibold tracking-widest uppercase mt-2">
            Higher/Lower Stat Trivia
          </p>
        </motion.header>

        {/* Sport Selection List */}
        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {sports.map((sport) => (
            <motion.div
              key={sport.id}
              variants={itemVariants}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl hover:border-[var(--text-secondary)] transition-colors duration-200"
            >
              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <div className="bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border-color)]">
                  {sport.icon}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-wide">{sport.name}</h2>
                  <p className="text-xs text-[var(--text-secondary)] font-medium">{sport.subtitle}</p>
                </div>
              </div>

              <div className="flex gap-2.5 sm:self-center">
                {sport.id === 'nba' ? (
                  <>
                    <button
                      onClick={() => navigate('/nba')}
                      className="flex-1 sm:flex-initial py-2 px-4 rounded-lg bg-[var(--nba-blue)] hover:bg-[#15346e] text-white transition-all text-xs font-bold uppercase tracking-wider border border-[var(--nba-blue)] shadow-lg shadow-[#1d428a]/10"
                    >
                      Classic
                    </button>
                    <button
                      onClick={() => navigate('/nba-daily')}
                      className="flex-1 sm:flex-initial py-2 px-4 rounded-lg bg-[var(--nba-red)] hover:bg-[#a60d24] text-white transition-all text-xs font-bold uppercase tracking-wider border border-[var(--nba-red)] shadow-lg shadow-[#c8102e]/10"
                    >
                      Daily
                    </button>
                  </>
                ) : sport.id === 'nfl' ? (
                  <button
                    onClick={() => navigate('/nfl')}
                    className="w-full sm:w-auto py-2 px-5 rounded-lg bg-[var(--nba-blue)] hover:bg-[#15346e] text-white transition-all text-xs font-bold uppercase tracking-wider border border-[var(--nba-blue)] shadow-lg shadow-[#1d428a]/10"
                  >
                    Play
                  </button>
                ) : (
                  <span className="w-full text-center sm:w-auto py-2 px-4 rounded-lg bg-[var(--bg-primary)] text-[var(--text-secondary)]/40 text-xs font-bold uppercase tracking-wider border border-[var(--border-color)]/40 select-none cursor-not-allowed">
                    Coming Soon
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        className="text-center text-[var(--text-secondary)] text-xs font-medium py-8 border-t border-[var(--border-color)]/40 mt-12 max-w-2xl w-full mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        Created by Rayane Hamoudi & Rafay Syed
      </motion.footer>
    </div>
  );
}

export default Home;