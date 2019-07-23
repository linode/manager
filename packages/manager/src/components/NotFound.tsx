import * as React from 'react';

import ErrorOutline from '@material-ui/icons/ErrorOutline';

import Placeholder from 'src/components/Placeholder';

interface Props {
  className?: string;
}

const NotFound = (props: Props) => {
  return (
    <Placeholder
      icon={ErrorOutline}
      title="Not Found"
      copy=""
      animate={false}
      className={props.className}
    />
  );
};

export default NotFound;
