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

  const title = linodeSetting
    ? `Edit SSH Access for ${linodeSetting.label}`
    : 'Edit SSH Access';

  return (
    <Drawer title={title} open={isOpen} onClose={closeDrawer}>
      {/* FORM GOES HERE */}
      <pre>{JSON.stringify(linodeSetting, null, 2)}</pre>
    </Drawer>
  );
};

export default EditSSHAccessDrawer;
