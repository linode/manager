import { shallow } from 'enzyme';
import { compose } from 'ramda';
import * as React from 'react';
import Typography from 'src/components/core/Typography';
import { appendPercentSign, formatNumber } from 'src/utilities/statMetrics';
import { MetricsDisplay } from './MetricsDisplay';


describe('CPUMetrics', () => {
  const mockMetrics = { max: 10, average: 5.5, last: 7.75, total: 40 };
  const format = compose(appendPercentSign, formatNumber);

  const wrapper = shallow(
    <MetricsDisplay
      classes={{root: '', legend: '', red: '', yellow: '', blue: 'blue', green: ''}}
      rows={[
        {
          legendTitle: 'Legend Title',
          legendColor: 'blue',
          data: mockMetrics,
          format
        }
      ]}
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

  it('renders the legend title', () => {
    expect(wrapper.find('[data-qa-legend-title]')).toHaveLength(1);
    expect(wrapper.find('[data-qa-legend-title]').text()).toEqual('Legend Title');
  });

  it('passes legendColor as a className', () => {
    expect(wrapper.find('[data-qa-legend-title]').hasClass('blue')).toBeTruthy();
  });

  it('renders formatted Max, Avg, and Last values in the table body', () => {
    ['10.00%', '5.50%', '7.75%'].forEach(section => {
      expect(wrapper.containsMatchingElement(
        <Typography>{section}</Typography>)).toBeTruthy();
    });
  });

  it('renders multiple rows', () => {
    wrapper.setProps({rows: [
      {
        legendTitle: 'Legend Title 1',
        legendColor: 'blue',
        data: mockMetrics,
        format
      },
      {
        legendTitle: 'Legend Title 2',
        legendColor: 'red',
        data: { max: 80, average: 90, last: 100, total: 110 },
        format
      }
    ]});
    expect(wrapper.find('[data-qa-legend-title]')).toHaveLength(2);
  })
});