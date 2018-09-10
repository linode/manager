import * as React from 'react';

import Typography from '@material-ui/core/Typography';

const NoOptionsMessage: React.StatelessComponent = (props:any) => {
  return (
    <Typography
      color="textSecondary"
      className={props.selectProps.classes.noOptionsMessage}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}

export default NoOptionsMessage;