import { shallow } from 'enzyme';
import * as React from 'react';
import Typography from 'src/components/core/Typography';

import { CPUMetrics } from './CPUMetrics';

describe('CPUMetrics', () => {
  const mockMetrics = {max: '10.00%', average: '5.50%', last: '7.75%'}
  const wrapper = shallow(
    <CPUMetrics
      classes={{root: '', legend: '', legendCol: ''}}
      metrics={mockMetrics}
    />
  );

  it('renders a table', () => {
    expect(wrapper.find('WithStyles(Table)')).toHaveLength(1);
  });

  it('renders Max, Avg, and Last table headers', () => {
    ['Max', 'Avg', 'Last'].forEach(section => {
      expect(wrapper.containsMatchingElement(
        <Typography>{section}</Typography>)).toBeTruthy();
    });
  });

  it('renders Max, Avg, and Last values in the table body', () => {
    ['10.00%', '5.50%', '7.75%'].forEach(section => {
      expect(wrapper.containsMatchingElement(
        <Typography>{section}</Typography>)).toBeTruthy();
    });
  });
});