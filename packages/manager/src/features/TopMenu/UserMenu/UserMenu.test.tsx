import { shallow } from 'enzyme';
import * as React from 'react';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { UserMenu } from './UserMenu';

const classes = {
  button: '',
  hidden: '',
  leftIcon: '',
  menu: '',
  menuItem: '',
  userWrapper: '',
  username: ''
};
it('renders without crashing', () => {
  shallow(<UserMenu classes={classes} {...reactRouterProps} />);
});
