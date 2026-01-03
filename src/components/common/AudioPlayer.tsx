import React, { useRef, useState } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface AudioPlayerProps {
  audioUrl: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  size = 'md',
  className = '',
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20,
  };

  const handlePlay = async () => {
    if (!audioUrl || !audioRef.current) return;

    try {
      setIsLoading(true);
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  if (!audioUrl) {
    return (
      <div className={`${sizeClasses[size]} flex items-center justify-center text-muted-foreground opacity-50 ${className}`}>
        <VolumeX size={iconSizes[size]} />
      </div>
    );
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={handleEnded}
        preload="none"
      />
      <motion.button
        onClick={handlePlay}
        whileTap={{ scale: 0.9 }}
        disabled={isLoading}
        className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors ${className}`}
      >
        {isLoading ? (
          <Loader2 size={iconSizes[size]} className="animate-spin" />
        ) : (
          <Volume2 size={iconSizes[size]} className={isPlaying ? 'animate-pulse' : ''} />
        )}
      </motion.button>
    </>
  );
};
