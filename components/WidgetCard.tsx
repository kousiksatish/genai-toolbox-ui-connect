
import React from 'react';
import styles from '../styles/WidgetCard.module.css';

interface WidgetCardProps {
  onClose: () => void;
}

const WidgetCard: React.FC<WidgetCardProps> = ({ onClose }) => {
  return (
    <div className={styles.card}>
      <button className={styles.closeButton} onClick={onClose}>
        &times;
      </button>
      {/* Add widget content here */}
    </div>
  );
};

export default WidgetCard;
