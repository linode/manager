import React from 'react';

import { CloudPulseContext } from './CloudPulseContext';

export const useCloudPulseContext = () => {
  return React.useContext(CloudPulseContext);
};
