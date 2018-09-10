import * as React from 'react';

import Chip from '@material-ui/core/Chip';

const chipStyles = {
  margin: '2px',
}

const MultiValue = (props:any) => {
  const onDelete = (event:React.SyntheticEvent<HTMLElement>) => {
    props.removeProps.onClick();
    props.removeProps.onMouseDown(event);
  }
  return (
    <Chip
      style={chipStyles}
      tabIndex={-1}
      label={props.children}
      onDelete={onDelete}
    />
  );
}

export default MultiValue;