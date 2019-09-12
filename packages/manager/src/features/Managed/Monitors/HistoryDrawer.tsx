import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import Drawer from 'src/components/Drawer';
import ErrorState from 'src/components/ErrorState';
import { ExtendedIssue } from 'src/store/managed/issues.actions';
import IssueCalendar from './IssueCalendar';

interface Props {
  open: boolean;
  error?: Linode.ApiFieldError[];
  loading: boolean;
  monitorLabel: string;
  issues: ExtendedIssue[];
  onClose: () => void;
}

export const HistoryDrawer: React.FC<Props> = props => {
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
  issues: Linode.ManagedIssue[],
  loading: boolean,
  error?: Linode.ApiFieldError[]
) => {
  if (loading) {
    return <CircleProgress />;
  }

  if (error) {
    return <ErrorState errorText={error[0].reason} />;
  }

  return <IssueCalendar issues={issues} />;
};

export default HistoryDrawer;
