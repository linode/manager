import * as React from 'react';

import CloudViewIcon from 'src/assets/icons/entityIcons/cv_overview.svg';
import { Divider } from 'src/components/Divider';
import { LandingHeader } from 'src/components/LandingHeader/LandingHeader';
import { Paper } from 'src/components/Paper';
import { Placeholder } from 'src/components/Placeholder/Placeholder';
export const Overview = React.memo(() => {
  return (
    <Paper>
      <LandingHeader breadcrumbProps={{ pathname: '/Metrics Visualization' }} />
      <Divider orientation="horizontal"></Divider>
      <Placeholder
        subtitle="No visualizations are available at this moment.
        Apply filters to view charts"
        icon={CloudViewIcon}
        title=""
      />
    </Paper>
  );
});
