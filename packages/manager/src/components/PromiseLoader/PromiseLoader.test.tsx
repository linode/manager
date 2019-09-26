import { shallow, ShallowWrapper } from 'enzyme';
import * as React from 'react';

import PromiseLoader from './PromiseLoader';

const mockAxiosResponse = (ms: number, result?: any) =>
  new Promise(resolve => setTimeout(() => resolve(result), ms));

describe('PromiseLoaderSpec', () => {
  const Component = () => <div id="component" />;
  const data = { name: 'whatever' };
  const preloaded = PromiseLoader({
    resource: async () => {
      await mockAxiosResponse(100);
      return Promise.resolve(data);
    }
  });
  const LoadedComponent = preloaded(Component);
  let wrapper: ShallowWrapper;

  describe('before resolution', () => {
    beforeEach(async () => {
      wrapper = shallow(<LoadedComponent />);
    });

    it('should display loading component.', async () => {
      expect(wrapper.find('[data-qa-circle-progress]').exists()).toBeTruthy();
    });
  });

  describe('after resolution', () => {
    beforeEach(async () => {
      wrapper = shallow(<LoadedComponent />);
      await mockAxiosResponse(120);
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
