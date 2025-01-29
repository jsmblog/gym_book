import { useState } from 'react';

const useMessage = () => {
  const [message, setMessage] = useState('');

  const messageError = (message) => {
    setMessage(message);
    setTimeout(() => setMessage(''), 5000);
  };

  return [message, messageError];
};

export default useMessage;
