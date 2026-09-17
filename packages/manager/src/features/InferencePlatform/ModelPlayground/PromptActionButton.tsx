import { ArrowUp, Square } from '@akamai/cds-icons/react';
import React from 'react';

import styles from './PromptActionButton.module.css';

interface PromptActionButtonProps {
  disabled: boolean;
  isLoading: boolean;
  onCancel: () => void;
  onSend: () => void;
}

export const PromptActionButton = ({
  disabled,
  isLoading,
  onCancel,
  onSend,
}: PromptActionButtonProps) => {
  if (isLoading) {
    return (
      <button
        aria-label="Cancel generation"
        className={`${styles.actionButton} ${styles.cancelButton}`}
        onClick={onCancel}
        type="button"
      >
        <Square aria-hidden="true" className={styles.cancelIcon} />
      </button>
    );
  }

  return (
    <button
      aria-label="Send prompt"
      className={`${styles.actionButton} ${styles.sendButton}`}
      disabled={disabled}
      onClick={onSend}
      type="button"
    >
      <ArrowUp aria-hidden="true" className={styles.sendIcon} />
    </button>
  );
};
