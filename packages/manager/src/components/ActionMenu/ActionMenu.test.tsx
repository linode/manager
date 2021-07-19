import { mount } from 'enzyme';
import * as React from 'react';
import ActionMenu from './ActionMenu';

describe('ActionMenu', () => {
  const action = { title: 'whatever', onClick: () => undefined };

  const manyActions = [action, action, action];

  it.skip('should render a menu when provided many or one action(s).', () => {
    const result = mount(
      <ActionMenu actionsList={manyActions} ariaLabel="label" />
    );
    expect(result.find('WithStyles(ActionMenu)')).toHaveLength(1);

    result.find('IconButton').simulate('click');
    expect(result.find('WithStyles(MenuItem)')).toHaveLength(4);
  });
});
