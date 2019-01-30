import { shallow } from 'enzyme';
import * as React from 'react';
import { DrawerContent } from './DrawerContent';

describe('DrawerContent', () => {
  const component = shallow(
    <DrawerContent title="Hello Drawer" loading={true} error={true}>
      <table />
    </DrawerContent>
  );

  it('should show loading component while loading is in progress', () => {
    expect(component.name()).toEqual('WithStyles(circleProgressComponent)');
    expect(component.find('table')).toHaveLength(0);
  });

  it('should show error if loading is finished but the error persists', () => {
    component.setProps({ loading: false });

    expect(component.name()).toEqual('WithStyles(Notice)');
    expect(component.find('table')).toHaveLength(0);
  });
  it('should display content if there is no error nor loading', () => {
    component.setProps({ error: false });

    expect(component.find('CircleProgress')).toHaveLength(0);
    expect(component.find('Notice')).toHaveLength(0);
    expect(component.find('table')).toHaveLength(1);
  });
});
