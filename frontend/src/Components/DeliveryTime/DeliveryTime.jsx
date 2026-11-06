import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DeliveryTime = ({ onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof onClose === 'function') {
      onClose();
    } else {
      navigate('/cart', { replace: true });
    }
  }, [onClose, navigate]);

  return null;
};

export default DeliveryTime;
