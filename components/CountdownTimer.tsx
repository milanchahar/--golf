'use client';
import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: Date;
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +targetDate - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const isEndingSoon = timeLeft.days === 0 && timeLeft.hours < 24;

  return (
    <div className={`flex gap-4 font-mono text-2xl font-bold ${isEndingSoon ? 'text-red-500 animate-pulse' : 'text-slate-200'}`}>
      <div className="flex flex-col items-center">
        <span>{String(timeLeft.days).padStart(2, '0')}</span>
        <span className="text-xs text-slate-400 font-sans uppercase">Days</span>
      </div>
      <span>:</span>
      <div className="flex flex-col items-center">
        <span>{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="text-xs text-slate-400 font-sans uppercase">Hours</span>
      </div>
      <span>:</span>
      <div className="flex flex-col items-center">
        <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="text-xs text-slate-400 font-sans uppercase">Mins</span>
      </div>
      <span>:</span>
      <div className="flex flex-col items-center">
        <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
        <span className="text-xs text-slate-400 font-sans uppercase">Secs</span>
      </div>
    </div>
  );
}
