'use client';

import { useState, useEffect } from 'react';

export default function ImageModal({ isOpen, onClose, imageUrl, imageAlt = "Screenshot" }) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Reset zoom and position when modal opens
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-60 w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full cursor-pointer flex items-center justify-center text-white text-xl font-bold transition-all duration-200 hover:scale-110 shadow-lg"
        aria-label="Close modal"
      >
        ×
      </button>

      {/* Zoom controls */}
      <div className="absolute top-4 left-4 z-60 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full cursor-pointer flex items-center justify-center text-white text-lg font-bold transition-all duration-200 hover:scale-110 shadow-lg"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center cursor-pointer justify-center text-white text-lg font-bold transition-all duration-200 hover:scale-110 shadow-lg"
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          onClick={handleResetZoom}
          className="w-12 h-12 bg-green-600 hover:bg-green-700 rounded-full flex items-center cursor-pointer justify-center text-white text-xs font-bold transition-all duration-200 hover:scale-110 shadow-lg"
          aria-label="Reset zoom"
        >
          1:1
        </button>
      </div>

      {/* Zoom level indicator */}
      <div className="absolute bottom-4 left-4 z-60 bg-gray-800 bg-opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
        {Math.round(zoom * 100)}%
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 z-60 bg-gray-800 bg-opacity-90 text-white px-4 py-2 rounded-lg text-xs shadow-lg">
        Scroll to zoom • Drag to pan • ESC to close
      </div>

      {/* Image container */}
      <div 
        className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <img
          src={imageUrl}
          alt={imageAlt}
          className="max-w-none transition-transform duration-200 ease-out select-none"
          style={{
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
            cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
          }}
          draggable={false}
          onLoad={() => {
            // Reset position when image loads
            setPosition({ x: 0, y: 0 });
          }}
        />
      </div>

      {/* Background overlay - click to close */}
      <div 
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  );
}
