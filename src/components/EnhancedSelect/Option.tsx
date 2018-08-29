import * as React from 'react';

import './EnhancedSelect.css';

const Option:React.StatelessComponent = (props:any) => {
  let classes = "enhancedSelect-menu-item"

  if ( props.isFocused ) { classes += " enhancedSelect-menu-item-highlighted"; }
  if ( props.isSelected )    { classes += " enhancedSelect-menu-item-selected"; }
  return (
    <div
      className={classes}
      {...props.innerProps}
    >
      {props.children}
    </div>
  );
}

export default Option;