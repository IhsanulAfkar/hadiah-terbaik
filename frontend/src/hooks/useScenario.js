
import { useEffect, useState } from 'react';
import api, { ENDPOINTS } from '../services/api';
import { useAuth } from '@/context/AuthContext';

export const useScenario = () => {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/kua/scenarios');
        setData(response.data.data);
      } catch (err) {
        console.error('Error fetching scenarios:', err);
        setError('Gagal memuat daftar skenario');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  return {
    data,
    isLoading
  }
}