import * as React from 'react';

import { LinodeDisks } from './LinodeDisks';
import { LinodeVolumes } from './LinodeVolumes';

export const LinodeStorage = () => {
  return (
    <>
      <LinodeDisks />
      <LinodeVolumes />
    </>
  );
};

export default LinodeStorage;
