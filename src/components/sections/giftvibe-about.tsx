"use client";

import React from "react";
import { motion } from "motion/react";
import Image from "next/image";

const GiftVibeAbout = () => {
  const stats = [
    { 
        number: "25+", 
        label: "Years of Excellence", 
        delay: 0.1, 
        icon: (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
        )
    },
    { 
        number: "10K+", 
        label: "Happy Clients", 
        delay: 0.2, 
        icon: (
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
        )
    },
    { 
        number: "50K+", 
        label: "Products Delivered", 
        delay: 0.3, 
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
        ) 
    },
    { 
        number: "100%", 
        label: "Quality Assured", 
        delay: 0.4, 
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
        ) 
    },
  ];

  // Features moved to dedicated WhyChooseUsSection component

  return (
    <div className="relative bg-white overflow-hidden">
      {/* Sophisticated Midnight Green Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Elegant gradient orbs with midnight green theme */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-[#0f4c5c]/15 to-[#124559]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-[#1a5d73]/15 to-[#2a6b80]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-[#124559]/10 to-[#4a9eb8]/15 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Professional geometric pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23124559' fill-opacity='0.3'%3E%3Cpath d='M30 30.5V28h-2v2.5h2zm-2 1.5v2.5h2V32h-2z'/%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        {/* Sophisticated floating elements */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-[#124559]/30 rounded-full animate-bounce delay-300"></div>
        <div className="absolute top-40 right-32 w-3 h-3 bg-[#2a6b80]/30 rounded-full animate-bounce delay-700"></div>
        <div className="absolute bottom-32 left-32 w-5 h-5 bg-[#4a9eb8]/30 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-40 right-20 w-4 h-4 bg-[#1a5d73]/30 rounded-full animate-bounce delay-500"></div>
        
        {/* Subtle scanning line effect */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full bg-gradient-to-r from-transparent via-[#124559]/20 to-transparent transform skew-x-12 animate-pulse"></div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-32">
        {/* Elegant & Pinteresty Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mb-24"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-block mb-8"
          >
            <Image
              src="/logo3.png"
              alt="GiftVibe Logo"
              width={240}
              height={96}
              className="h-16 md:h-20 w-auto mx-auto drop-shadow-lg filter brightness-105"
              priority
            />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 text-[#124559] leading-tight tracking-tight"
          >
            Ravindra Enterprises
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="relative inline-block"
          >
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
              Manufacturers of Diaries, Note Books and Corporate Gifts <br/>Crafting Excellence Since 1999 - Your Premier Partner for Corporate Gifting Solutions
            </p>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-[#124559]/50 to-[#2a6b80]/50 rounded-full"></div>
          </motion.div>
        </motion.div>

        {/* Elegant & Pinteresty Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-28"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: stat.delay, ease: "easeOut" }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="text-[#124559] mb-4 inline-block">
                {stat.icon}
              </div>
              <h3 className="text-3xl md:text-4xl font-semibold text-[#124559] mb-2 tracking-tight">
                {stat.number}
              </h3>
              <p className="text-gray-500 text-base">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Epic Company Story Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-28">
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="space-y-6"
          >
            <h2 className="text-4xl md:text-5xl font-black text-[#124559] mb-8 leading-tight">
              Our Journey of 
              <span className="bg-gradient-to-r from-[#2a6b80] to-[#4a9eb8] bg-clip-text text-transparent"> Excellence</span>
            </h2>
            <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl font-medium"
              >
                Incorporated in 1999, Ravindra Enterprises stands as one of the industry's most trusted names in manufacturing and exporting premium Corporate Diaries and Gifts. From our state-of-the-art facilities, we deliver excellence to clients worldwide.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Our comprehensive range includes Desk Calendars, Art Cover Diaries, Corporate Diaries, Executive Planners, Promotional Pens, and specialized diaries for professionals. Each product reflects our commitment to quality and innovation.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="font-semibold text-[#124559]"
              >
                Under the visionary leadership of our Founders, we've established ourselves as industry leaders through client-centered approaches and unwavering dedication to excellence.
              </motion.p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 80, rotateY: -20 }}
            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-600/30 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-3xl blur-xl animate-pulse"></div>
            <Image
              src="/about.png"
              alt="GiftVibe About Us"
              width={700}
              height={500}
              className="relative z-10 rounded-3xl shadow-2xl w-full group-hover:scale-105 transition-transform duration-500"
            />
          </motion.div>
        </div>
      </div>

    </div>
  );
};

export default GiftVibeAbout;