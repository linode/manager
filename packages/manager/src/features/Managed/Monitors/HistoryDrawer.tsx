import { ManagedIssue } from '@linode/api-v4/lib/managed';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { CircleProgress } from 'src/components/CircleProgress';
import { Drawer } from 'src/components/Drawer';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { IssueCalendar } from './IssueCalendar';

interface HistoryDrawerProps {
  error?: APIError[] | null;
  issues: ManagedIssue[] | undefined;
  loading: boolean;
  monitorLabel: string;
  onClose: () => void;
  open: boolean;
}

export const HistoryDrawer = (props: HistoryDrawerProps) => {
  const { error, issues, loading, monitorLabel, onClose, open } = props;
  return (
    <Drawer
      onClose={onClose}
      open={open}
      title={`Issue History: ${monitorLabel}`}
    >
      {renderDrawerContent(issues, loading, error)}
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

const renderDrawerContent = (
  issues: ManagedIssue[] | undefined,
  loading: boolean,
  error?: APIError[] | null
) => {
  if (error) {
    return (
      <ErrorState
        errorText={
          getAPIErrorOrDefault(error, 'Error loading your issue history')[0]
            .reason
        }
      />
    );
  }
  if (loading || issues === undefined) {
    return <CircleProgress />;
  }
  return <IssueCalendar issues={issues} />;
};
