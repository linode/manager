import ErrorOutline from '@mui/icons-material/ErrorOutline';
import * as React from 'react';

import { Placeholder } from 'src/components/Placeholder/Placeholder';

interface Props {
  className?: string;
}

export const NotFound = (props: Props) => {
  return (
    <Placeholder
      className={props.className}
      icon={ErrorOutline}
      title="Not Found"
    />
  );
};
