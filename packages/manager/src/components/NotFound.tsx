import * as React from 'react';

import ErrorOutline from '@mui/icons-material/ErrorOutline';

import { Placeholder } from 'src/components/Placeholder/Placeholder';

interface Props {
  className?: string;
}

const NotFound = (props: Props) => {
  return (
    <Placeholder
      icon={ErrorOutline}
      title="Not Found"
      className={props.className}
    />
  );
};

export default NotFound;
