import * as React from 'react';
import { components as reactSelectComponents } from 'react-select';
import _MenuList, {
  MenuListComponentProps
} from 'react-select/lib/components/Menu';

const Menu: React.StatelessComponent<MenuListComponentProps<any>> = props => {
  const { guidance } = props.selectProps;

  return (
    <React.Fragment>
      <reactSelectComponents.MenuList {...props}>
        {props.children}
      </reactSelectComponents.MenuList>
      {guidance !== undefined && <div>booyah</div>}
    </React.Fragment>
  );
};

export default Menu;
