import * as React from 'react';
import { Option as OOption } from 'react-select/lib/components/Option';

import './EnhancedSelect.css';

const Option = (props:any) => {
  let classes = "enhancedSelect-menu-item";

  if ( props.isFocused )  { classes += " enhancedSelect-menu-item-highlighted"; }
  if ( props.isSelected ) { classes += " enhancedSelect-menu-item-selected"; }
  return (
    <div
      className={classes}
      {...props.innerProps}
    >
      <OOption {...props} />
    </div>
  );
}

export default Option;