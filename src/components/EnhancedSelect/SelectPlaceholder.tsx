import * as React from 'react';

import Typography from '@material-ui/core/Typography';

const SelectPlaceholder: React.StatelessComponent = (props:any) => {
  return (
    <Typography
      color="textSecondary"
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}

export default SelectPlaceholder;