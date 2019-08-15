import * as React from 'react';
import Drawer from 'src/components/Drawer';

import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {}
}));

interface Props {
  linodeSetting?: Linode.ManagedLinodeSetting;
  isOpen: boolean;
  closeDrawer: () => void;
}

type CombinedProps = Props;

const EditSSHAccessDrawer: React.FC<CombinedProps> = props => {
  const { isOpen, closeDrawer, linodeSetting } = props;
  const classes = useStyles();

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
