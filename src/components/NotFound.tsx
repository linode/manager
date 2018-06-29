import * as React from 'react';

import { ErrorOutline } from '@material-ui/icons';

import Placeholder from 'src/components/Placeholder';

const NotFound = () => {
  return (
    <Placeholder 
      icon={ErrorOutline}
      title="Not Found" 
      copy=""
      animate={false}
    />
  );
}

export default NotFound;
