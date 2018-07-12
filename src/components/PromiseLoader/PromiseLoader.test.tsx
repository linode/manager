import { shallow, ShallowWrapper } from 'enzyme';
import * as React from 'react';

import PromiseLoader from './PromiseLoader';

const mockAxiosResponse = (
  ms: number,
  result?: any,
) => new Promise(resolve => setTimeout(() => resolve(result), ms));

describe('PromiseLoaderSpec', () => {
  const Component = () => <div id="component"></div>;
  const data = { name: 'whatever' };
  const preloaded = PromiseLoader({ resource: () => Promise.resolve(data) });
  const LoadedComponent = preloaded(Component);
  let wrapper: ShallowWrapper;

  describe('before resolution', () => {
    beforeEach(async () => {
      wrapper = shallow(<LoadedComponent />);
    });

    it('should display loading component.', async () => {
      expect(wrapper.find('WithStyles(CircleProgressComponent)').exists()).toBeTruthy();
    });
  });

  describe('after resolution', async () => {
    beforeEach(async () => {
      wrapper = shallow(<LoadedComponent />);
      await mockAxiosResponse(100);
      wrapper.update();
    });

    it('should render the Component.', () => {
      expect(wrapper.find('Component').exists()).toBeTruthy();
    });

    it('should inject props onto Component.', async () => {
      expect(wrapper.props()).toHaveProperty('resource', { response: data });
    });
  });
});
