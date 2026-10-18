import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginPage from './LoginPage';
import Registor from './Registor';
import MotionScroll from './test';
import { debounce } from 'lodash';

const cardVariants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 },
};

const Card = ({ content }) => (
  <motion.div
    className="overflow-auto"
    variants={cardVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.5, ease: 'easeInOut' }}
    style={{
      width: 500,
      height: 600,
      backgroundColor: 'white',
      display: 'flex',
      borderRadius: 10,
      margin: 10,
      boxShadow: '10px 10px 20px rgba(0, 0, 0, 0.2)',
      flexDirection: 'column',
      padding: '10px',
    }}
  >
    {content === 1 ? <LoginPage /> : <Registor />}
  </motion.div>
);
const CardSwitcher = () => {
  const [currentCard, setCurrentCard] = useState(0);
  const cards = [1, 2];
  const [tikNextCard, setTikNextCard] = useState(false);
  const [btnNextCard, setBtnNextCard] = useState('ลงทะเบียน');
  const nextCard = useCallback(
    debounce(() => {
      setTikNextCard((prev) => !prev);
      setCurrentCard((prev) => (prev + 1) % cards.length);
      if (tikNextCard == false) {
        setBtnNextCard('เข้าสู่ระบบ');
      } else if (tikNextCard == true) {
        setBtnNextCard('ลงทะเบียน');
      }
    }, 500),
    [currentCard, cards.length]
  );

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/path-to-your-image.png')" }}
    >
      <AnimatePresence mode="wait">
        <Card key={currentCard} content={cards[currentCard]} />
      </AnimatePresence>
      <button
        onClick={nextCard}
        className="ml-5 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
      >
        {btnNextCard}
      </button>
    </div>
  );
};

export default CardSwitcher;
