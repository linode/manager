import { Button } from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import * as React from 'react';

import { useBreakpoint } from '../../hooks/useBreakpoint';
import { Box } from '../../Shared/Box/Box';
import { IAM_TFA_ENFORCE_PENDO_IDS } from '../constants';
import styles from './TfaEnforcement.module.css';
interface Props {
  clearDisabled: boolean;
  filteredUsersCount: number;
  onClear: () => void;
  onSelectAll: () => void;
  scopedOptionsLength: number;
  selectedScopedCount: number;
  selectedUsersCount: number;
}

export const AccountUsersTableControls = ({
  clearDisabled,
  filteredUsersCount,
  onClear,
  onSelectAll,
  scopedOptionsLength,
  selectedScopedCount,
  selectedUsersCount,
}: Props) => {
  const isSmUp = useBreakpoint('up', 'sm');

  return (
    <Box
      className={styles.controlsContainer}
      direction="row"
      style={{
        justifyContent: isSmUp ? 'flex-start' : 'space-between',
      }}
    >
      <Box
        className={styles.controlsSelectedUsersContainer}
        direction="row"
        style={{
          gap: isSmUp ? Spacing.S8 : undefined,
        }}
      >
        <span>
          Users selected: {selectedUsersCount}/{filteredUsersCount}
        </span>
        {isSmUp && <div className={styles.divider} />}
      </Box>

      <Box className={styles.controlsButtonsContainer} direction="row">
        <Button
          data-pendo-id={IAM_TFA_ENFORCE_PENDO_IDS.bulkSelectAllPages}
          disabled={
            scopedOptionsLength === 0 ||
            selectedScopedCount >= scopedOptionsLength
          }
          onClick={onSelectAll}
          type="button"
          variant="link"
        >
          Select all
        </Button>
        {isSmUp && <div className={styles.divider} />}
        <Button
          data-pendo-id={IAM_TFA_ENFORCE_PENDO_IDS.bulkDeselect}
          disabled={clearDisabled}
          onClick={onClear}
          type="button"
          variant="link"
        >
          Clear all
        </Button>
      </Box>
    </Box>
  );
};
