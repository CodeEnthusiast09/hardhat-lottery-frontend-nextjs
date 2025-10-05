import { useState, useEffect } from "react";

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export const useCountdown = (
  lastTimeStamp: bigint | undefined,
  interval: bigint | undefined
): TimeLeft => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    if (!lastTimeStamp || !interval) {
      setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: false });
      return;
    }

    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const nextDraw = Number(lastTimeStamp) + Number(interval);
      const timeRemaining = Math.max(0, nextDraw - now);

      const hours = Math.floor(timeRemaining / 3600);
      const minutes = Math.floor((timeRemaining % 3600) / 60);
      const seconds = timeRemaining % 60;

      setTimeLeft({ 
        hours, 
        minutes, 
        seconds,
        isExpired: timeRemaining === 0
      });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [lastTimeStamp, interval]);

  return timeLeft;
};
