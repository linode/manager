import { ActionsPanel, Drawer } from '@linode/ui';
import * as React from 'react';

import { NotFound } from 'src/components/NotFound';

import { IssueCalendar } from './IssueCalendar';

import type { ManagedIssue } from '@linode/api-v4/lib/managed';
import type { APIError } from '@linode/api-v4/lib/types';

interface HistoryDrawerProps {
  error?: APIError[] | null;
  isFetching: boolean;
  issues: ManagedIssue[] | undefined;
  monitorLabel: string;
  onClose: () => void;
  open: boolean;
}

export const HistoryDrawer = (props: HistoryDrawerProps) => {
  const { error, isFetching, issues, monitorLabel, onClose, open } = props;
  return (
    <Drawer
      NotFoundComponent={NotFound}
      error={error}
      isFetching={isFetching}
      onClose={onClose}
      open={open}
      title={`Issue History: ${monitorLabel}`}
    >
      <IssueCalendar issues={issues ?? []} />
      <ActionsPanel
        primaryButtonProps={{
          'data-testid': 'close',
          label: 'Close',
          onClick: () => onClose(),
        }}
      />
    </Drawer>
  );
};
