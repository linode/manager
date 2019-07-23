import { shallow } from 'enzyme';
import * as React from 'react';
import { StackScriptDrawer } from './StackScriptDrawer';

describe('StackScripts Drawer', () => {
  const component = shallow(
    <StackScriptDrawer open={false} stackScriptId={5} closeDrawer={jest.fn()} />
  );

  it('should render DrawerContent component', () => {
    expect(component.find('DrawerContent')).toHaveLength(1);
  });
});
