import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const lastRedirect = sessionStorage.getItem("last_404_redirect");
    const now = Date.now();

    if (lastRedirect && now - parseInt(lastRedirect, 10) < 2000) {
      // If a redirection attempt occurred less than 2 seconds ago, we are in a loop.
      // Force redirect to the safe home page.
      navigate("/", { replace: true });
    } else {
      sessionStorage.setItem("last_404_redirect", now.toString());
      navigate(-1);
      
      // Fallback: If no history exists, redirect to home page "/" after 100ms
      const timeout = setTimeout(() => {
        navigate("/", { replace: true });
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [navigate]);

  return null;
};

export default NotFound;