import { shallow } from 'enzyme';
import * as React from 'react';

import withLoadingAndError from './withLoadingAndError';

const MyComponent: React.SFC<{}> = props => {
  return <div />;
};

const EnhancedComponent = withLoadingAndError(MyComponent);

const component = shallow(<EnhancedComponent />);

describe('withLoadingAndError HOC', () => {
  describe('Props are defined', () => {
    it('should have a loading prop', () => {
      expect(component.props().loading).toBeDefined();
    });
    it('should have a setLoadingAndClearErrors prop', () => {
      expect(component.props().setLoadingAndClearErrors).toBeDefined();
    });
    it('should have a setErrorAndClearLoading prop', () => {
      expect(component.props().setErrorAndClearLoading).toBeDefined();
    });
    it('should have a clearLoadingAndErrors prop', () => {
      expect(component.props().clearLoadingAndErrors).toBeDefined();
    });
  });

  describe('when setLoadingAndClearErrors prop is called', () => {
    it('should set loading prop and clear errors', () => {
      component.props().setLoadingAndClearErrors();
      expect(component.props().loading).toBeTruthy();
      expect(component.props().error).toBeUndefined();
    });
  });

  describe('when setErrorAndClearLoading prop is called', () => {
    it('should set loading prop and clear errors', () => {
      component.props().setErrorAndClearLoading('hello world');
      expect(component.props().loading).toBeFalsy();
      expect(component.props().error).toBe('hello world');
    });
  });

  describe('when clearLoadingAndErrors prop is called', () => {
    it('should set loading prop and clear errors', () => {
      component.props().clearLoadingAndErrors();
      expect(component.props().loading).toBeFalsy();
      expect(component.props().error).toBeUndefined();
    });
  });
});
