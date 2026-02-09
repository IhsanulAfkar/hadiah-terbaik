
import { useEffect, useState } from 'react';
import api, { ENDPOINTS } from '../services/api';

export const useKecamatan = () => {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // 1. Fetch Stats from optimized endpoint
        const resStats = await api.get(ENDPOINTS.DISTRICTS);

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