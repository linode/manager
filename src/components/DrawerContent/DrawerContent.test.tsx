import { shallow } from 'enzyme';
import * as React from 'react';
import { DrawerContent } from './DrawerContent';

describe('DrawerContent', () => {
  it('should show loading component while loading is in progress', () => {
    const component = shallow(
        <DrawerContent
          title="Hello Drawer"
          loading={true}
          error={true}
					>
					<table />
				</DrawerContent>
      );

		expect(component.name()).toEqual('WithStyles(circleProgressComponent)');
		expect(component.find('table')).toHaveLength(0);
	});

  it('should show error if loading is finished but the error persists', () => {
    const component = shallow(
        <DrawerContent
          title="Hello Drawer"
          loading={false}
          error={true}
					>
					<table />
				</DrawerContent>
      );
    
		expect(component.name()).toEqual('WithStyles(Notice)');
		expect(component.find('table')).toHaveLength(0);
  });
  it('should display content if there is no error nor loading', () => {
    const component = shallow(
        <DrawerContent
          title="Hello Drawer"
          loading={false}
          error={false}
        >
					<table />
				</DrawerContent>
      );
		
		expect(component.find('CircleProgress')).toHaveLength(0);
		expect(component.find('Notice')).toHaveLength(0);
    expect(component.find('table')).toHaveLength(1);
  });
});
