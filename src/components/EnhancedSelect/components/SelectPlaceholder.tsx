import * as React from 'react';

import Typography from '@material-ui/core/Typography';

const placeholderStyles = {
  position: 'absolute',
  left: '10px'
}

const SelectPlaceholder: React.StatelessComponent = (props:any) => {
  return (
    <Typography
    style={placeholderStyles}
      color="textSecondary"
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}

export default SelectPlaceholder;