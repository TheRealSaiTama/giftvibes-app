'use client';

import { useState } from 'react';

const WhatsAppButton = () => {
  const [isHovered, setIsHovered] = useState(false);
  const phoneNumber = '919899223130';
  const message = 'Hi, I want to enquire about your products...';

  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full px-5 py-4 shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out"
      aria-label="WhatsApp us"
    >
      <svg
        viewBox="0 0 32 32"
        className="w-6 h-6 fill-current"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M16 0c-8.837 0-16 7.163-16 16 0 2.825 0.737 5.607 2.137 8.048l-2.137 7.952 8.135-2.135c2.369 1.313 5.061 2.135 7.865 2.135 8.837 0 16-7.163 16-16s-7.163-16-16-16zM16 29.333c-2.547 0-5.053-0.747-7.2-2.133l-0.496-0.293-5.147 1.36 1.373-5.12-0.32-0.533c-1.547-2.267-2.347-4.907-2.347-7.613 0-7.36 5.973-13.333 13.333-13.333s13.333 5.973 13.333 13.333-5.973 13.333-13.333 13.333zM22.4 18.507c-0.387-0.2-2.347-1.16-2.72-1.293-0.373-0.147-0.64-0.2-0.907 0.187s-1.040 1.293-1.28 1.56c-0.227 0.267-0.467 0.307-0.853 0.107-0.387-0.2-1.653-0.613-3.147-1.947-1.16-1.040-1.947-2.32-2.173-2.707s-0.027-0.613 0.173-0.813c0.187-0.173 0.4-0.453 0.6-0.68 0.2-0.227 0.267-0.387 0.4-0.653 0.133-0.267 0.067-0.507-0.027-0.707s-0.907-2.187-1.24-2.987c-0.32-0.787-0.653-0.68-0.907-0.693-0.227-0.013-0.507-0.013-0.773-0.013s-0.707 0.107-1.067 0.507c-0.373 0.4-1.413 1.387-1.413 3.373s1.453 3.907 1.653 4.173c0.2 0.267 2.827 4.32 6.867 6.053 0.96 0.413 1.707 0.667 2.293 0.853 0.96 0.307 1.84 0.267 2.533 0.16 0.773-0.12 2.347-0.96 2.667-1.893 0.333-0.933 0.333-1.733 0.227-1.893-0.080-0.187-0.347-0.293-0.733-0.493z" />
      </svg>
      <span className="font-semibold text-sm whitespace-nowrap">
        WhatsApp Us
      </span>
    </button>
  );
};

export default WhatsAppButton;
