import * as React from 'react';
import { compose } from 'recompose';

const CheckZone: React.FC<{}> = props => {
  return <div>Check Zone</div>;
};

export default compose<{}, {}>(React.memo)(CheckZone);
