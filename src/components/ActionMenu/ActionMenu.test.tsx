import * as React from 'react';
import { StaticRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import ActionMenu from './ActionMenu';

describe('ActionMenu', () => {
  const action = { title: 'whatever', onClick: () => undefined };
  const createActionsOne = (closeMenu: Function) => {
    return [action];
  };
  const createActionsMany = (closeMenu: Function) => {
    return [action, action, action];
  };

  it('should render a link when provided one action.', () => {
    const result = mount(
      <StaticRouter context={{}}>
        <ActionMenu createActions={createActionsOne} />
      </StaticRouter>,
    );
    expect(result.find('a')).toHaveLength(1);
  });

  it('should render a menu when provided many actions.', () => {
    const result = mount(
      <StaticRouter context={{}}>
        <ActionMenu createActions={createActionsMany}/>
      </StaticRouter>,
    );
    expect(result.find('WithStyles(ActionMenu)')).toHaveLength(1);

    result.find('IconButton').simulate('click');
    expect(result.find('WithStyles(MenuItem)')).toHaveLength(4);
  });
});
