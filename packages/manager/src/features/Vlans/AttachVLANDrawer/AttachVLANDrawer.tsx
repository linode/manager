import * as React from 'react';
import Drawer from 'src/components/Drawer';

export const AttachVLANDrawer: React.FC<{}> = _ => {
  return <Drawer title="Attach a Linode" open={true} />;
};

export default React.memo(AttachVLANDrawer);
