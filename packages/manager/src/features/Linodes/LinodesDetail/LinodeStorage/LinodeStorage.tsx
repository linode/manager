import * as React from 'react';
import { LinodeDisks } from '../LinodeAdvanced/LinodeDisks';
import { LinodeVolumes } from '../LinodeAdvanced/LinodeVolumes';

export const LinodeStorage = () => {
  return (
    <>
      <LinodeDisks />
      <LinodeVolumes />
    </>
  );
};

export default LinodeStorage;
