import { useEffect, useState } from 'react';

interface Countdown {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

const getCountdown = (endDate: string): Countdown => {
  const now = new Date().getTime();
  const end = new Date(endDate).getTime();
  const diff = end - now;

  if (diff <= 0) return { days: '00', hours: '00', minutes: '00', seconds: '00' };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
};

export const useCountdowns = (leases: any[] = []) => {
  const [leasesWithCountdown, setLeasesWithCountdown] = useState<any[]>([]);

  useEffect(() => {
    const updateCountdowns = () => {
      const updated = leases.map((lease) => ({
        ...lease,
        countdown: getCountdown(lease.endDate),
      }));
      setLeasesWithCountdown(updated);
    };

    updateCountdowns(); // initial run
    const interval = setInterval(updateCountdowns, 1000); // update every second

    return () => clearInterval(interval);
  }, [leases]);

  return leasesWithCountdown;
};
