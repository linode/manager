import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { AxiosResponse } from 'axios';
import AxiosPreloader from './AxiosPreloader';

const mockAxiosResponse = (
  ms: number,
  result?: any,
) => new Promise<AxiosResponse>(resolve => setTimeout(() => resolve(result), ms));

describe('AxiosPreloaderSpec', () => {
  const Component = () => <div id="component"></div>;
  const response = { data: { name: 'whatever' } };
  const preloaded = AxiosPreloader({ resource: () => mockAxiosResponse(0, response) });
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
      expect(wrapper.props()).toHaveProperty('resource', response.data);
    });
  });
});
