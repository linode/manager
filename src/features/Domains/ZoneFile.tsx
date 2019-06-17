import * as React from 'react';
import { compose } from 'recompose';

const ZoneFile: React.FC<{}> = props => {
  return <div>Zone file</div>;
};

export default compose<{}, {}>(React.memo)(ZoneFile);
