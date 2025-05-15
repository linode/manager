import { ActionsPanel, Drawer } from '@linode/ui';
import * as React from 'react';

import { IssueCalendar } from './IssueCalendar';

import type { APIError } from '@linode/api-v4';
import type { ManagedIssue } from '@linode/api-v4/lib/managed';
interface HistoryDrawerProps {
  isFetching: boolean;
  issues: ManagedIssue[] | undefined;
  monitorError: APIError[] | null;
  monitorLabel: string | undefined;
  onClose: () => void;
  open: boolean;
}

export const HistoryDrawer = (props: HistoryDrawerProps) => {
  const { isFetching, issues, monitorError, monitorLabel, onClose, open } =
    props;

  return (
    <Drawer
      error={monitorError}
      isFetching={isFetching}
      onClose={onClose}
      open={open}
      title={`Issue History: ${monitorLabel ?? 'Unknown'}`}
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
