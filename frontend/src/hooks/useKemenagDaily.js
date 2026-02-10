
import { useEffect, useState } from 'react';
import api, { ENDPOINTS } from '../services/api';

export const useKemenagDaily = () => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // 1. Fetch Stats from optimized endpoint
        const resStats = await api.get(ENDPOINTS.KEMENAG_REPORT + '/daily')

        setData(resStats.data.data)

        setIsLoading(false)
      } catch (error) {
        setIsLoading(false)
        console.error('Failed to fetch dashboard data', error);
      }
    };

    fetchData();
  }, []);
  return {
    data,
    isLoading
  }
}