import {
  SegmentedButton,
  SegmentedButtonGroup,
} from '@akamai/cds-components/react/SegmentedButton';
import React from 'react';

import GridViewIcon from 'src/assets/icons/grid-view.svg';
import CardView from 'src/features/InferencePlatform/assets/icons/cardview.svg';

import { Box } from '../components/Box/Box';
import styles from './ListDisplayStyleToggle.module.css';

type ViewMode = 'grid' | 'list';

interface ListDisplayStyleToggleProps {
  onChange: (mode: ViewMode) => void;
  value: ViewMode;
}

export const ListDisplayStyleToggle = ({
  onChange,
  value,
}: ListDisplayStyleToggleProps) => (
  <SegmentedButtonGroup
    className={styles.mainContainer}
    onChange={(event) => {
      const { value: next } = (event as CustomEvent<{ value: string }>).detail;
      onChange(next as ViewMode);
    }}
    size="small"
    value={value}
  >
    <SegmentedButton
      aria-label="Grid view"
      className={styles.button}
      value="grid"
    >
      <Box className={styles.icon} component={CardView} />
    </SegmentedButton>
    <SegmentedButton
      aria-label="List view"
      className={styles.button}
      value="list"
    >
      <Box className={styles.icon} component={GridViewIcon} />
    </SegmentedButton>
  </SegmentedButtonGroup>
);
