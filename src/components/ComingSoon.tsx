import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ComingSoonProps {
  sport: string;
}

function ComingSoon({ sport }: ComingSoonProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen py-8 px-4 bg-[var(--bg-primary)] text-white flex flex-col items-center justify-center">
      <div className="max-w-md w-full">
        {/* Main Card wrapper */}
        <motion.div 
          className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-8 text-center shadow-xl"
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div 
            className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {sport} Trivia Mode
          </motion.div>
          <motion.h2 
            className="game-title text-3xl font-extrabold text-white mb-4"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Coming Soon
          </motion.h2>
          <motion.p 
            className="text-sm text-[var(--text-secondary)] mb-8 max-w-sm mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            We are working hard to gather historical player data, compile award lists, and design stats sheets for {sport}. Stay tuned!
          </motion.p>
          <motion.button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-white border border-[var(--border-color)] text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Back to Home
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

export default ComingSoon;