import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Navigate back to the previous page in history
    navigate(-1);
    
    // Fallback: If no history exists, redirect to home page "/" after 100ms
    const timeout = setTimeout(() => {
      navigate("/", { replace: true });
    }, 100);

    return () => clearTimeout(timeout);
  }, [navigate]);

  return null;
};

export default NotFound;