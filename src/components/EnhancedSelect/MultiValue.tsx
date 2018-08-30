import * as React from 'react';

import Chip from '@material-ui/core/Chip';

const MultiValue = (props:any) => {
  const onDelete = (event:React.SyntheticEvent<HTMLElement>) => {
    props.removeProps.onClick();
        props.removeProps.onMouseDown(event);
  }
  return (
    <Chip
      tabIndex={-1}
      label={props.children}
      className={props.selectProps.classes.chip}
      onDelete={onDelete}
    />
  );
}

export default MultiValue;