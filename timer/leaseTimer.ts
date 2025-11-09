// hooks/useCountdowns.ts
import { useEffect, useMemo, useState } from 'react';

const countDown = (endDate: string) => {
  const now = new Date().getTime();
  const end = new Date(endDate).getTime();
  const difference = end - now;

  if (difference <= 0) {
    return { days: '00', hours: '00', minutes: '00', seconds: '00' };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
};

export const useCountdowns = (leases: any[] = []) => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const leasesWithTimer = useMemo(() => {
    return leases.map((lease: any) => ({
      ...lease,
      countdown: countDown(lease.endDate),
    }));
  }, [leases, tick]);

  return leasesWithTimer;
};
