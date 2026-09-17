import React from 'react';

import styles from './InferenceLoader.module.css';

interface InferenceLoaderProps {
  color: string;
}

export const InferenceLoader = ({ color }: InferenceLoaderProps) => (
  <span
    aria-label="Generating response"
    className={styles.loader}
    role="progressbar"
    style={{ color }}
  />
);
