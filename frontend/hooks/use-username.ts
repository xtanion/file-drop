'use client';

import { useState, useEffect } from 'react';
import { generateRandomUsername as generateUsername } from '@/lib/username-generator';

export const useUsername = () => {
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      const newUsername = generateUsername();
      localStorage.setItem('username', newUsername);
      setUsername(newUsername);
    }
  }, []);

  return username;
};