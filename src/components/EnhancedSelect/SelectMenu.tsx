import * as React from 'react';

import Paper from '@material-ui/core/Paper';

const SelectMenu: React.StatelessComponent = (props:any) => {
  return (
    <Paper square className={props.selectProps.classes.paper} {...props.innerProps}>
      {props.children}
    </Paper>
  );
}

export default SelectMenu;