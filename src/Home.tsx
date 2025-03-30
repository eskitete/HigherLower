import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Circle, CircleDot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen py-8 px-4 bg-[#0a0a0a] relative overflow-hidden">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=2070")'
        }}
      />
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
          className="text-center mb-16"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="game-title text-7xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            SPORTS HIGHER/LOWER
          </h1>
          <p className="text-white/60 text-xl font-light">Select a sport to start playing!</p>
        </motion.header>

        {/* Sport Selection Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {sports.map((sport) => (
            <motion.button
              key={sport.id}
              onClick={() => navigate(`/${sport.id}`)}
              variants={itemVariants}
              className="group relative overflow-hidden rounded-2xl bg-white/5 p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-white/5 backdrop-blur-md border border-white/10"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${sport.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
              <div className="relative flex flex-col items-center gap-6">
                <div className={`${sport.color} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12`}>
                  {sport.icon}
                </div>
                <h2 className="text-2xl font-bold text-white tracking-wide">{sport.name}</h2>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default Home; 