import { useEffect } from 'react';
import { useNavigate } from '@modern-js/runtime/router';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/chat', { replace: true });
  }, [navigate]);

  return null;
};

export default Index;
