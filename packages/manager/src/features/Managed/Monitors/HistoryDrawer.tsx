import { ManagedIssue } from '@linode/api-v4/lib/managed';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import Drawer from 'src/components/Drawer';
import ErrorState from 'src/components/ErrorState';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import IssueCalendar from './IssueCalendar';

interface Props {
  open: boolean;
  error?: APIError[] | null;
  loading: boolean;
  monitorLabel: string;
  issues: ManagedIssue[] | undefined;
  onClose: () => void;
}

export const HistoryDrawer: React.FC<Props> = (props) => {
  const { error, issues, loading, monitorLabel, onClose, open } = props;
  return (
    <Drawer
      title={`Issue History: ${monitorLabel}`}
      open={open}
      onClose={onClose}
    >
      {renderDrawerContent(issues, loading, error)}
      <ActionsPanel>
        <Button buttonType="primary" onClick={() => onClose()} data-qa-close>
          Close
        </Button>
      </ActionsPanel>
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

export default HistoryDrawer;
