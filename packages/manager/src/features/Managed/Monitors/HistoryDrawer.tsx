import { ActionsPanel, Drawer } from '@linode/ui';
import * as React from 'react';

import { NotFound } from 'src/components/NotFound';

import { IssueCalendar } from './IssueCalendar';

import type { ManagedIssue } from '@linode/api-v4/lib/managed';

interface HistoryDrawerProps {
  isFetching: boolean;
  issues: ManagedIssue[] | undefined;
  monitorLabel: string | undefined;
  onClose: () => void;
  open: boolean;
}

export const HistoryDrawer = (props: HistoryDrawerProps) => {
  const { isFetching, issues, monitorLabel, onClose, open } = props;
  return (
    <Drawer
      isFetching={isFetching}
      NotFoundComponent={NotFound}
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
