'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ProductGalleryProps {
  imageUrl: string;
  productName: string;
}

function getFileIdFromUrl(url: string): string | null {
  if (!url) return null;
  const regex = /(?:\/d\/|\?id=|&id=)([a-zA-Z0-9_-]{28,})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export default function ProductGallery({ imageUrl, productName }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const url = imageUrl?.trim();
  let finalImageUrl = '/placeholder-product.jpg';

  if (url) {
    if (url.includes('drive.google.com')) {
      const fileId = getFileIdFromUrl(url);
      if (fileId) {
        finalImageUrl = `https://drive.google.com/uc?id=${fileId}`;
      }
    } else if (/^https?:\/\//i.test(url)) {
      finalImageUrl = url;
    }
  }

  const images = [finalImageUrl, finalImageUrl, finalImageUrl];

  return (
    <div className="space-y-4">
      <div className="relative aspect-square bg-white rounded-xl overflow-hidden border border-gray-200 group">
        <div className="absolute left-3 top-3 bottom-3 flex flex-col gap-2 z-10">
          <div className="bg-[#1a5f7a] text-white text-xs font-bold px-2.5 py-10 rounded-lg shadow-lg">
            <div className="writing-mode-vertical text-center tracking-[0.15em]">
              EXECUTIVE SIZE
            </div>
          </div>
        </div>
        <div className="relative w-full h-full flex items-center justify-center p-8">
          <Image
            src={images[selectedImage]}
            alt={productName}
            fill
            className={`object-contain transition-transform duration-300 ${
              isZoomed ? 'scale-150' : 'scale-100'
            }`}
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
        <button
          onClick={() => setIsZoomed(!isZoomed)}
          className="absolute top-4 right-4 bg-white hover:bg-gray-50 p-2.5 rounded-full shadow-lg border border-gray-200 transition-all opacity-0 group-hover:opacity-100"
          aria-label="Zoom image"
        >
          <svg
            className="w-5 h-5 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
            />
          </svg>
        </button>
      </div>

      <div className="flex gap-3 justify-start">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSelectedImage(idx);
              setIsZoomed(false);
            }}
            className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
              selectedImage === idx
                ? 'border-[#1a5f7a] shadow-md ring-2 ring-[#1a5f7a]/20'
                : 'border-gray-200 hover:border-gray-300 opacity-60 hover:opacity-100'
            }`}
          >
            <Image
              src={img}
              alt={`${productName} thumbnail ${idx + 1}`}
              fill
              className="object-cover"
              sizes="80px"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
