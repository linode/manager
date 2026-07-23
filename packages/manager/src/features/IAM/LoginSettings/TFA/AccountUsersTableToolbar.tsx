import { Button, Icon, Select, Tooltip } from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import * as React from 'react';
import { useFormContext } from 'react-hook-form';

import { useBreakpoint } from '../../hooks/useBreakpoint';
import { Box } from '../../Shared/Box/Box';
import { DebouncedSearchField } from '../../Shared/DebouncedSearchField/DebouncedSearchField';
import { IAM_TFA_ENFORCE_PENDO_IDS } from '../constants';
import styles from './TfaEnforcement.module.css';

import type { SelectOption } from '../../Shared/types';
import type { TfaEnforcementFormValues } from './TfaEnforcementLanding';

const filterableOptions: SelectOption[] = [
  { label: 'Not selected first', value: 'unselected' },
  { label: 'Selected first', value: 'selected' },
];

type SortOrder = 'selected' | 'unselected';

interface Props {
  hasInteracted: boolean;
  isLoading: boolean;
  onRefreshSorting: () => void;
  onSearch: (value: string) => void;
  onSortOrderChange: (value: SortOrder) => void;
  query: string;
  scopedOptionsLength: number;
  sortOrder: SortOrder;
}

export const AccountUsersTableToolbar = ({
  hasInteracted,
  isLoading,
  onRefreshSorting,
  onSearch,
  onSortOrderChange,
  query,
  scopedOptionsLength,
  sortOrder,
}: Props) => {
  const {
    formState: { isDirty },
  } = useFormContext<TfaEnforcementFormValues>();
  const isSmUp = useBreakpoint('up', 'sm');

  return (
    <Box
      className={styles.toolbarContainer}
      direction="row"
      style={{
        flexWrap: isSmUp ? 'nowrap' : 'wrap',
        gap: isSmUp ? Spacing.S24 : Spacing.S12,
      }}
    >
      <DebouncedSearchField
        data-pendo-id={IAM_TFA_ENFORCE_PENDO_IDS.searchUsernameOrEmail}
        isLoading={isLoading}
        onSearch={onSearch}
        placeholder="Search username or email"
        style={{ width: isSmUp ? 280 : '100%' }}
        value={query}
      />
      <Box
        className={styles.toolbarSortingContainer}
        direction="row"
        style={{
          gap: isSmUp ? Spacing.S12 : Spacing.S8,
          width: isSmUp ? 'fit-content' : '100%',
        }}
      >
        <p
          style={{
            width: isSmUp ? 'fit-content' : '100%',
          }}
        >
          Sort by
        </p>
        <Select
          data-pendo-id={IAM_TFA_ENFORCE_PENDO_IDS.sortByUsers}
          items={filterableOptions}
          onChange={(e) => {
            const item = (e as CustomEvent).detail as SelectOption;
            if (item?.value === 'selected' || item?.value === 'unselected') {
              onSortOrderChange(item.value);
            }
          }}
          selected={filterableOptions.find((o) => o.value === sortOrder)}
          valueFn={(item) => (item as SelectOption).label}
        />
      </Box>
      {hasInteracted && isDirty && (
        <Tooltip
          className={styles.toolbarTooltip}
          tooltipPlacement="bottom"
          tooltipText="Re-sort the list based on your current selections."
        >
          <Button
            data-pendo-id={IAM_TFA_ENFORCE_PENDO_IDS.refreshSorting}
            disabled={scopedOptionsLength === 0}
            onClick={onRefreshSorting}
            type="button"
            variant="link"
          >
            <Icon icon="reload" size="s" />
            Re-sort list
            <Icon icon="info-outline" size="s" />
          </Button>
        </Tooltip>
      )}
    </Box>
  );
};
