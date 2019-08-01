import * as React from 'react';

import MonitorTable from './MonitorTable';

import { monitors } from 'src/__data__/serviceMonitors';

export const Monitors: React.FC<{}> = (props) => {
return (
  <MonitorTable monitors={monitors} />
 )
}


export default Monitors;