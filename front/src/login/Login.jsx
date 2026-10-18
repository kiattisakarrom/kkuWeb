import React from 'react';
import { motion } from 'framer-motion';
import backgroundImage from '../../img/Background1.png';
import CardSwitcher from './SelectRoom';

export default function login() {
  const backgroundStyle = {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: '100vh',
    width: '100%',
  };

  return (
    <div style={backgroundStyle}>
      <div className="h-screen flex ml-44">
        <CardSwitcher />
      </div>
    </div>
  );
}
