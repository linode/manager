import * as React from 'react';
import { LinodeDisks } from '../LinodeAdvanced/LinodeDisks';
import LinodeVolumes from 'src/features/Linodes/LinodesDetail/LinodeAdvanced/LinodeVolumes';

export const LinodeStorage = () => {
  return (
    <>
      <LinodeDisks />
      <LinodeVolumes />
    </>
  );
};

export default LinodeStorage;
