 import { useState } from 'react';
import { recommendationsApi } from '../services/api';

export default function useRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateRecommendations = async (quizAnswers) => {
    try {
      setLoading(true);
      setError('');

      const response = await recommendationsApi.generate(quizAnswers);

      setRecommendations(response.data.recommendations || []);
      return response.data;
    } catch (err) {
      console.error('Recommendation error:', err);
      setError('Failed to generate recommendations');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    recommendations,
    loading,
    error,
    generateRecommendations,
  };
}
