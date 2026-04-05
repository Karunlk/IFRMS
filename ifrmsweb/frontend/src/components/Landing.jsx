import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, X, Clock, BarChart } from 'lucide-react';

export default function Landing({ onNavigate }) {
  const [selectedProgram, setSelectedProgram] = useState(null);

  const programs = [
    { 
      title: 'Strength & Conditioning', 
      image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop', 
      tags: ['Beginner Friendly', 'Muscle Gain'],
      description: 'Build a solid foundation of strength and improve your overall conditioning. This program focuses on compound movements, proper form, and progressive overload to help you build muscle and increase endurance safely and effectively.',
      duration: '12 Weeks',
      level: 'All Levels'
    },
    { 
      title: 'HIIT Burn', 
      image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?q=80&w=800&auto=format&fit=crop', 
      tags: ['High Intensity', 'Weight Loss'],
      description: 'A high-intensity interval training program designed to maximize calorie burn and improve cardiovascular fitness. Short, intense bursts of exercise followed by brief recovery periods will push your limits and deliver rapid results.',
      duration: '8 Weeks',
      level: 'Intermediate/Advanced'
    },
    { 
      title: 'Yoga & Flexibility', 
      image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop', 
      tags: ['Recovery', 'Mindfulness'],
      description: 'Enhance your flexibility, balance, and mental focus with our comprehensive yoga program. Perfect for active recovery, reducing stress, and improving joint mobility. Connect your mind and body through guided flows and deep stretches.',
      duration: 'Ongoing',
      level: 'Beginner Friendly'
    }
  ];

  return (
    <div className="pt-20 relative">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2000&auto=format&fit=crop" 
            alt="Gym Hero" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-12">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter mb-6 leading-[1.1]"
          >
            FITNESS IS NOT A DESTINATION. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">
              IT'S A WAY OF LIFE.
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto font-medium"
          >
            MUSCLE UP Gym Management System. Track your workouts, book expert trainers, and achieve your goals with real-time insights.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => onNavigate('auth')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-zinc-200 transition-colors"
          >
            Start Your Journey <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">Explore Programs</h2>
            <p className="text-xl text-zinc-400 font-medium">Find what moves you.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {programs.map((program, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              onClick={() => setSelectedProgram(program)}
              className="group relative h-[450px] rounded-3xl overflow-hidden cursor-pointer"
            >
              <img src={program.image} alt={program.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <div className="flex flex-wrap gap-2 mb-4">
                  {program.tags.map(tag => (
                    <span key={tag} className="px-3 py-1.5 bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider rounded-md text-white">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-3xl font-bold text-white leading-tight">{program.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Program Details Modal */}
      <AnimatePresence>
        {selectedProgram && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProgram(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl z-10"
            >
              <div className="h-64 sm:h-80 relative">
                <img src={selectedProgram.image} alt={selectedProgram.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
                <button 
                  onClick={() => setSelectedProgram(null)}
                  className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 backdrop-blur-md text-white rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-8 -mt-20 relative z-10">
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedProgram.tags.map(tag => (
                    <span key={tag} className="px-3 py-1.5 bg-rose-500/20 text-rose-500 border border-rose-500/30 text-xs font-bold uppercase tracking-wider rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">{selectedProgram.title}</h3>
                
                <div className="flex flex-wrap gap-6 mb-6 pb-6 border-b border-zinc-800">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Clock className="w-5 h-5 text-rose-500" />
                    <span className="font-medium">{selectedProgram.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <BarChart className="w-5 h-5 text-rose-500" />
                    <span className="font-medium">{selectedProgram.level}</span>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h4 className="text-lg font-bold text-white mb-2">About this program</h4>
                  <p className="text-zinc-400 leading-relaxed">
                    {selectedProgram.description}
                  </p>
                </div>
                
                <button 
                  onClick={() => {
                    setSelectedProgram(null);
                    onNavigate('auth');
                  }}
                  className="w-full py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                >
                  Join MUSCLE UP to Enrol <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
