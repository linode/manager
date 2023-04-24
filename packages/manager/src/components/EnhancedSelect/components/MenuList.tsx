import * as React from 'react';
import { components as reactSelectComponents } from 'react-select';
import { MenuListComponentProps } from 'react-select';
import Guidance from './Guidance';

type CombinedProps = MenuListComponentProps<any, any>;

const Menu: React.FC<CombinedProps> = (props) => {
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
