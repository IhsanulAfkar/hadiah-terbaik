
import { useEffect, useState } from 'react';
import api, { ENDPOINTS } from '../services/api';

export const useKemenagRekap = (period = 'week') => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [kecamatan, setKecamatan] = useState([])
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // 1. Fetch Stats from optimized endpoint
        const resStats = await api.get(ENDPOINTS.KEMENAG_REPORT, {
          params: {
            period,
            kode_kecamatan: kecamatan.join(',')
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
  }, [period, kecamatan]);
  return {
    data,
    isLoading,
    filter: {
      kecamatan, setKecamatan
    }
  }
}