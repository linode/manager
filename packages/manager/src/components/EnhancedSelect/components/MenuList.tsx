import * as React from 'react';
import {
  components as reactSelectComponents,
  MenuListComponentProps,
} from 'react-select';
import { Guidance } from './Guidance';

const Menu = (props: MenuListComponentProps<any, any>) => {
  const { guidance } = props.selectProps;

  return (
    <React.Fragment>
      <reactSelectComponents.MenuList {...props}>
        <div data-qa-autocomplete-popper>{props.children}</div>
      </reactSelectComponents.MenuList>
      {guidance !== undefined && <Guidance text={guidance} />}
    </React.Fragment>
  );
};

export default Menu;
