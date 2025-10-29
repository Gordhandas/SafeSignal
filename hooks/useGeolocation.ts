import { useState, useEffect } from 'react';
import { Location } from '../types';

const useGeolocation = (updateInterval: number = 60000): Location | null => {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({
          lat: latitude,
          lng: longitude,
          timestamp: Date.now(),
        });
        setError(null);
      },
      (err) => {
        setError(err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    fetchLocation();
    const intervalId = setInterval(fetchLocation, updateInterval);
    return () => clearInterval(intervalId);
  }, [updateInterval]);

  if (error) {
    console.error("Geolocation error:", error);
  }

  return location;
};

export default useGeolocation;
