
import { useEffect, useState } from 'react';
import api, { ENDPOINTS } from '../services/api';

export const useKemenagRekapDetail = (period = 'week', id) => {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // 1. Fetch Stats from optimized endpoint
        const resStats = await api.get(ENDPOINTS.KEMENAG_REPORT + `/${id}`, {
          params: {
            period
          }
        });

        setData(resStats.data.data)

        setIsLoading(false)
      } catch (error) {
        setIsLoading(false)
        console.error('Failed to fetch dashboard data', error);
      }
    };

    fetchData();
  }, [period]);

  return {
    data,
    isLoading,
  }
}