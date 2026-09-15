import React from 'react';

import { Link } from 'src/components/Link';
import Beaker from 'src/features/InferencePlatform/assets/icons/beaker.svg';

import { Box } from '../../components';
import styles from './TryInPlayground.module.css';

interface TryInPlaygroundProps {
  /** Model ID pre-selected when opening the Playground. */
  modelId: string;
}

/**
 * "Try in Playground" call-to-action: the Playground joypad icon followed by
 * the label, rendered as a filled action button that opens the Playground with
 * the current model pre-selected.
 */
export const TryInPlayground = ({ modelId }: TryInPlaygroundProps) => {
  return (
    <Link
      className={styles.button}
      search={{ model: modelId }}
      to="/inference-platform/model-playground"
    >
      <Box className={styles.playgroundIcon} component={Beaker} />
      Try in Playground
    </Link>
  );
};
