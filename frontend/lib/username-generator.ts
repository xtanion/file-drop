// Random username generator with adjectives and nouns
const adjectives = [
  'Swift', 'Bright', 'Clever', 'Bold', 'Silent', 'Mystic', 'Radiant', 'Stellar',
  'Quantum', 'Cyber', 'Digital', 'Neon', 'Cosmic', 'Arctic', 'Phoenix', 'Thunder',
  'Shadow', 'Crystal', 'Emerald', 'Silver', 'Golden', 'Crimson', 'Azure', 'Violet',
  'Rapid', 'Fierce', 'Gentle', 'Wise', 'Noble', 'Brave', 'Calm', 'Sharp',
  'Sleek', 'Smooth', 'Quick', 'Agile', 'Nimble', 'Fluid', 'Solid', 'Prime',
  'Ultra', 'Mega', 'Super', 'Hyper', 'Turbo', 'Sonic', 'Laser', 'Plasma'
];

const nouns = [
  'Wolf', 'Eagle', 'Tiger', 'Lion', 'Hawk', 'Falcon', 'Raven', 'Phoenix',
  'Dragon', 'Panther', 'Cheetah', 'Leopard', 'Jaguar', 'Lynx', 'Puma', 'Cougar',
  'Bear', 'Shark', 'Dolphin', 'Whale', 'Octopus', 'Squid', 'Manta', 'Stingray',
  'Viper', 'Cobra', 'Python', 'Anaconda', 'Gecko', 'Iguana', 'Salamander', 'Newt',
  'Owl', 'Sparrow', 'Robin', 'Cardinal', 'Finch', 'Canary', 'Parrot', 'Macaw',
  'Runner', 'Rider', 'Glider', 'Flyer', 'Jumper', 'Climber', 'Surfer', 'Diver'
];

export function generateRandomUsername(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 999) + 1;
  
  return `${adjective}${noun}${number}`;
}

export function validateUsername(username: string): { isValid: boolean; error?: string } {
  const trimmed = username.trim();
  
  if (trimmed.length === 0) {
    return { isValid: false, error: 'Username cannot be empty' };
  }
  
  if (trimmed.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters' };
  }
  
  if (trimmed.length > 20) {
    return { isValid: false, error: 'Username must be 20 characters or less' };
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }
  
  return { isValid: true };
}