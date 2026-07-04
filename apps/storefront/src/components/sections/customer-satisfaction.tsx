"use client";
import * as React from "react";

import { motion } from "motion/react";

const CustomerSatisfaction: React.FC = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay: 0.2 }}
      className="relative w-full py-20 px-4 md:px-8 overflow-hidden shadow-2xl mt-12"
      style={{
        background: 'linear-gradient(135deg, #124559 0%, #2a6b80 50%, #4a9eb8 100%)',
      }}
    >
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
        <svg className="relative block w-full h-12" viewBox="0 0 1200 120" preserveAspectRatio="none" fill="white">
          <path d="M321.39 56.44c58-10.79 114.16-30.13 172-41.86 82.39-16.72 168.19-17.73 250.45-.39C823.78 31 906.67 72 985.66 92.3c70.05 18.48 146.53 26.09 214.34 3V0H0v27.35a600.21 600.21 0 00321.39 29.09z" />
        </svg>
      </div>

      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}></div>

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        <motion.h2 
          className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="relative inline-block">
            Customer Satisfaction
            <span className="absolute -bottom-2 left-0 w-full h-1 bg-white/30 rounded-full transform skew-x-12"></span>
          </span>
        </motion.h2>
        
        <motion.p
          className="text-lg md:text-xl text-white/90 mb-10 leading-relaxed max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Our commitment to excellence drives us to exceed expectations at every step. With our extensive merchant network and quality-first approach, we ensure every product meets global standards while satisfying the diverse needs of our valued clients.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
        >
          <button className="inline-flex items-center px-6 py-3 text-lg font-black text-white bg-[#124559] border-4 border-black rounded-md shadow-[0.1em_0.1em_0_black] hover:translate-x-[-0.05em] hover:translate-y-[-0.05em] hover:shadow-[0.15em_0.15em_0_black] active:translate-x-[0.05em] active:translate-y-[0.05em] active:shadow-[0.05em_0.05em_0_black] transition-all duration-200 cursor-pointer">
            <span className="mr-2">✨</span>
            Experience Excellence Today
            <span className="ml-2 text-2xl leading-none">...</span>
          </button>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default CustomerSatisfaction;


