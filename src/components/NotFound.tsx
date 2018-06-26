import * as React from 'react';

import { ErrorOutline } from '@material-ui/icons';

import Placeholder from 'src/components/Placeholder';

const notFound = () => {
  return (
    <Placeholder 
      icon={ErrorOutline}
      title="Not Found" 
      copy=""
      animate={false}
    />
  );
}

export default notFound;
