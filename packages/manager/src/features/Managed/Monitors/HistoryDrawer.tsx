import * as React from 'react';

import Drawer from 'src/components/Drawer';

interface Props {
  open: boolean;
  error?: Linode.ApiFieldError[];
  loading: boolean;
  monitorLabel: string;
  issues: any[];
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
    </Drawer>
  );
};

const renderDrawerContent = (
  issues: Linode.ManagedIssue[],
  loading: boolean,
  error?: Linode.ApiFieldError[]
) => {
  if (loading) {
    return <div>Loading!</div>;
  }

  if (error) {
    return <div>Error!</div>;
  }

  if (issues.length === 0) {
    return <div>Empty</div>;
  }

  return issues.map((i, idx) => <div key={idx}>{i.id}</div>);
};

export default HistoryDrawer;
