
import React from 'react';
import styles from '../styles/WidgetCard.module.css';
import Spinner from './Spinner';

interface WidgetCardProps {
  onClose: () => void;
  children: React.ReactNode;
  isLoading?: boolean;
}

const WidgetCard: React.FC<WidgetCardProps> = ({ onClose, children, isLoading }) => {
  return (
    <div className={styles.card}>
      <button className={styles.closeButton} onClick={onClose}>
        &times;
      </button>
      {isLoading ? <Spinner /> : children}
    </div>
  );
};

export default WidgetCard;
