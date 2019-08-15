import * as React from 'react';
import Drawer from 'src/components/Drawer';

interface Props {
  linodeSetting?: Linode.ManagedLinodeSetting;
  isOpen: boolean;
  closeDrawer: () => void;
}

type CombinedProps = Props;

const EditSSHAccessDrawer: React.FC<CombinedProps> = props => {
  const { isOpen, closeDrawer, linodeSetting } = props;

  const drawerTitle = linodeSetting
    ? `Edit SSH Access for ${linodeSetting.label}`
    : 'Edit SSH Access';

  return (
    <Drawer title={drawerTitle} open={isOpen} onClose={closeDrawer}>
      SSH Access Drawer
    </Drawer>
  );
};

export default EditSSHAccessDrawer;
