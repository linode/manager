import * as React from 'react';
import { components as reactSelectComponents } from 'react-select';
import _MenuList, {
  MenuListComponentProps
} from 'react-select/lib/components/Menu';

interface Props extends MenuListComponentProps<any> {
  guidance?: string;
}

const Menu: React.StatelessComponent<Props> = props => {
  const { guidance } = props;
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
