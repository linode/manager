import React from 'react';

import LeftArrowIcon from 'src/assets/icons/arrow-left.svg';
import { Link } from 'src/components/Link';

import styles from './PlaygroundLink.module.css';

interface PlaygroundLinkProps {
  modelId: string;
}

export const PlaygroundLink = ({ modelId }: PlaygroundLinkProps) => {
  return (
    <Link
      className={styles.link}
      search={{ model: modelId }}
      to="/inference-platform/model-playground"
    >
      <span className={styles.content}>
        <span className={styles.text}>Playground</span>
        <LeftArrowIcon className={styles.arrow} height={18} width={18} />
      </span>
    </Link>
  );
};
