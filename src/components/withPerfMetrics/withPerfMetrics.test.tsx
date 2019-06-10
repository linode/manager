import { shallow } from 'enzyme';
import * as React from 'react';
import withPerfMetrics from './withPerfMetrics';

const mockStart = jest.fn();
const mockEnd = jest.fn();

jest.mock('src/perfMetrics', () => ({
  perfume: {
    start: (metricName: string) => mockStart(metricName),
    end: (metricName: string) => mockEnd(metricName)
  }
}));

describe('withPerfMetrics', () => {
  const Component = () => <div />;
  const WrappedComponent = withPerfMetrics('TestComponent')(Component);
  const wrapper = shallow(<WrappedComponent />);

  it('begins a perf metric reading in the constructor', () => {
    expect(mockStart).toHaveBeenCalledWith('TestComponent');
  });

  it('passes a prop to child component which can be used to end the reading', () => {
    expect(wrapper.prop('endPerfMeasurement')).toBeDefined();
    wrapper.prop('endPerfMeasurement')();
    expect(mockEnd).toBeCalledWith('TestComponent');
  });
});
