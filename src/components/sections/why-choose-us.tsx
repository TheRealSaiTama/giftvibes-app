"use client";

import React from "react";
import { motion } from "motion/react";

const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Ethical Business Practices",
    description: "Built on trust and transparency for lasting partnerships.",
    delay: 0.1,
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "On-Time Deliveries",
    description: "Reliable shipping and delivery commitments you can count on.",
    delay: 0.2,
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1h4v1m-4 0h-4v-1h4m0-4h2a2 2 0 012 2v2h-2V6h-2V4zM8 4H6a2 2 0 00-2 2v2h2V6h2V4zM6 16v2a2 2 0 002 2h2v-2H8v-2H6zM16 18v-2h2v2a2 2 0 01-2 2h-2v-2h2z" />
      </svg>
    ),
    title: "Reasonable Prices",
    description: "Competitive pricing without compromising on quality.",
    delay: 0.3,
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v1hH5v-1zM6 18a2 2 0 002 2h8a2 2 0 002-2V8H6v10zM9 14h6" />
      </svg>
    ),
    title: "High-Grade Product Range",
    description: "Premium quality stationery products that exceed expectations.",
    delay: 0.4,
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    title: "Customized Packaging",
    description: "Tailored packaging solutions for your brand requirements.",
    delay: 0.5,
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-2h8a1 1 0 001-1zM21 11V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2" />
      </svg>
    ),
    title: "Huge Distribution Network",
    description: "Extensive reach across nationwide markets and beyond.",
    delay: 0.6,
  },
];

const WhyChooseUsSection: React.FC = () => {
  return (
    <section className="text-center py-16">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-4xl md:text-5xl font-semibold mb-6 text-[#124559]"
      >
        Why Choose Us?
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="text-lg text-gray-600 max-w-2xl mx-auto mb-16"
      >
        We are more than just a stationery provider; we are your partners in success. Here’s why discerning clients choose Ravindra Enterprises.
      </motion.p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: feature.delay, ease: "easeOut" }}
            whileHover={{
              y: -8,
              boxShadow: "0 20px 25px -5px rgba(18, 69, 89, 0.1), 0 10px 10px -5px rgba(18, 69, 89, 0.08)",
            }}
            className="bg-white rounded-2xl p-8 text-left transition-all duration-300 group border border-gray-100/80"
          >
            <div className="p-5 rounded-full bg-gradient-to-br from-[#e0f7fa] to-[#b2ebf2] inline-block mb-6 shadow-inner">
              <div className="text-3xl text-[#124559] filter drop-shadow-sm group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 tracking-tight mb-3">
              {feature.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default WhyChooseUsSection;


