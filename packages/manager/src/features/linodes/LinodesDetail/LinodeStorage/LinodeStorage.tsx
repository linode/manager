import * as React from 'react';
import LinodeDisks from '../LinodeAdvanced/LinodeDisks';
import LinodeVolumes from 'src/features/linodes/LinodesDetail/LinodeAdvanced/LinodeVolumes';

export const LinodeStorage = () => {
  return (
    <>
      <LinodeDisks />
      <LinodeVolumes />
    </>
  );
};

export default LinodeStorage;
