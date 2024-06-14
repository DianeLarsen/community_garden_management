"use client"
import { useState, useEffect } from 'react';
import SignInPopup from './SignInPopup';

const AuthLinks = () => {
  const [isSignInVisible, setIsSignInVisible] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <div>
      {isAuthenticated ? (
        <button onClick={handleSignOut}>Sign Out</button>
      ) : (
        <div>
          <button onClick={() => setIsSignInVisible(true)}>Sign In</button>
          <SignInPopup isVisible={isSignInVisible} onClose={() => setIsSignInVisible(false)} />
        </div>
      )}
    </div>
  );
};

export default AuthLinks;
