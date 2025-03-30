import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ComingSoonProps {
  sport: string;
}

function ComingSoon({ sport }: ComingSoonProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen py-8 px-4 bg-[#0a0a0a] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/95 to-[#0a0a0a]" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto relative">
        {/* Header */}
        <motion.header 
          className="flex justify-between items-center mb-12"
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
            <ArrowLeft className="w-6 h-6 text-white group-hover:rotate-[-180deg] transition-transform duration-300" />
          </motion.button>
          <motion.h1 
            className="game-title text-5xl bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {sport.toUpperCase()} TRIVIA
          </motion.h1>
        </motion.header>

        {/* Coming Soon Message */}
        <motion.div 
          className="scoreboard rounded-2xl p-12 text-center backdrop-blur-md border border-white/10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <motion.div 
            className="text-5xl font-bold text-white mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            Coming Soon!
          </motion.div>
          <motion.p 
            className="text-white/80 text-xl mb-12 max-w-2xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            We're working hard to bring you {sport} trivia. Stay tuned for updates!
          </motion.p>
          <motion.button
            onClick={() => navigate('/')}
            className="bg-white/10 text-white px-8 py-3 rounded-lg text-xl hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/10"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            Back to Home
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

export default ComingSoon; 