import * as React from 'react';
import { mount } from 'enzyme';
import ActionMenu from './ActionMenu';

describe('ActionMenu', () => {
  const action = { title: 'whatever', onClick: () => undefined };
  const createActionsOne = (push: Function, closeMenu: Function) => {
    return [action];
  };
  const createActionsMany = (push: Function, closeMenu: Function) => {
    return [action];
  };

  it('should render a link when provided one action.', () => {
    const result = mount(<ActionMenu createActions={createActionsOne} />);
    expect(result.find('a')).toHaveLength(1);
  });
  
  it('should render a menu when provided many actions.', () => {
    const result = mount(<ActionMenu createActions={createActionsMany}/>);
    expect(result.find('WithStyles(ActionMenu)')).toHaveLength(1);

    result.find('IconButton').simulate('click');
    expect(result.find('WithStyles(MenuItem)')).toHaveLength(3);
  });
});
