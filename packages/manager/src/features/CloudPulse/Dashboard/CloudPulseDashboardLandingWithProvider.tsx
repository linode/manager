import React from 'react';

import { CloudPulseContextProvider } from '../Context/CloudPulseContextProvider';
import { CloudPulseDashboardLanding } from './CloudPulseDashboardLanding';

export const CloudPulseDashboardLandingWithProvider = () => {
  return (
    <CloudPulseContextProvider>
      <CloudPulseDashboardLanding />
    </CloudPulseContextProvider>
  );
};
