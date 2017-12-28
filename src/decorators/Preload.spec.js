import React from 'react';
import { mount } from 'enzyme';

import Preload from './Preload';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe('decorators/Preload', () => {
  const LoadingComponent = () => <div />;
  const ChildComponent = () => <div />;
  const createPreloader = (delay, method, loader, child) =>
    Preload({ delay, loader, method })(child);

  it('should render loading component', async () => {
    const mockPromise = jest.fn(() => sleep(200));
    const PreloadedComponent = createPreloader(
      200,
      mockPromise,
      LoadingComponent,
      ChildComponent
    );
    const wrapper = mount(React.createElement(PreloadedComponent, { myProp: true }));

    // Initial / Loading
    expect(wrapper.find(LoadingComponent)).toHaveLength(1);
    expect(wrapper.find(LoadingComponent).props())
      .toEqual({ isLoading: true, error: undefined, pastDelay: false });

    // Resolved
    await sleep(200);
    wrapper.update();
    expect(wrapper.find(ChildComponent)).toHaveLength(1);
    expect(wrapper.find(ChildComponent).props())
      .toEqual({ myProp: true });
  });

  it('should render loading component with error', async () => {
    const mockRejection = jest.fn(() => Promise.reject(new TypeError()));
    const PreloadedComponent = createPreloader(
      200,
      mockRejection,
      LoadingComponent,
      ChildComponent
    );
    const wrapper = mount(React.createElement(PreloadedComponent, { myProp: true }));

    await sleep(300);
    wrapper.update();
    expect(wrapper.find(LoadingComponent)).toBeDefined();
    expect(wrapper.find(LoadingComponent).prop('error')).toBeInstanceOf(TypeError);
  });
});
