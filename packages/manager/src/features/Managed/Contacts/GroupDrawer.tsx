import * as React from 'react';
import Drawer from 'src/components/Drawer';

interface Props {
  isOpen: boolean;
  closeDrawer: () => void;
  groupName: string;
  contacts: Linode.ManagedContact[];
}

type CombinedProps = Props;

const GroupDrawer: React.FC<CombinedProps> = props => {
  const { isOpen, closeDrawer, groupName } = props;

  const title = groupName ? `Edit ${groupName}` : 'Edit Group';

  return (
    <Drawer title={title} open={isOpen} onClose={closeDrawer}>
      {/* FORM GOES HERE */}
    </Drawer>
  );
};

export default GroupDrawer;
