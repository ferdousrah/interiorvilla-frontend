'use client'

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const WebsiteLoader: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(timer);
          setTimeout(() => setIsLoading(false), 500);
          return 100;
        }
        return prevProgress + 2;
      });
    }, 50);

    return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-white"
        >
          <div className="text-center">
            <div className="mb-8">
              <img
                src="/interior-villa-dark.png"
                alt="Interior Villa"
                className="w-64 h-auto mx-auto"
              />
            </div>
            <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <p className="mt-4 text-gray-600 font-['Fahkwang',Helvetica]">
              Loading... {progress}%
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};