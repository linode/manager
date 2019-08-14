import { shallow } from 'enzyme';
import * as React from 'react';
import Typography from 'src/components/core/Typography';
import { formatPercentage } from 'src/utilities/statMetrics';
import { metricsBySection, MetricsDisplay } from './MetricsDisplay';

describe('CPUMetrics', () => {
  const mockMetrics = {
    max: 10,
    average: 5.5,
    last: 7.75,
    total: 40,
    length: 3
  };

  const wrapper = shallow(
    <MetricsDisplay
      classes={{
        root: '',
        legend: '',
        purple: '',
        yellow: '',
        blue: 'blue',
        green: '',
        text: '',
        tableHeadInner: ''
      }}
      rows={[
        {
          legendTitle: 'Legend Title',
          legendColor: 'blue',
          data: mockMetrics,
          format: formatPercentage
        }
      ]}
    />
  );

  it('renders a table', () => {
    expect(wrapper.find('WithStyles(WrappedTable)')).toHaveLength(1);
  });

  it('renders Max, Avg, and Last table headers', () => {
    ['Max', 'Avg', 'Last'].forEach(section => {
      expect(
        wrapper.containsMatchingElement(<Typography>{section}</Typography>)
      ).toBeTruthy();
    });
  });

  it('renders the legend title', () => {
    expect(wrapper.find('[data-qa-legend-title]')).toHaveLength(1);
    expect(wrapper.find('[data-qa-legend-title]').text()).toEqual(
      'Legend Title'
    );
  });

  it('passes legendColor as a className', () => {
    expect(
      wrapper.find('[data-qa-legend-title]').hasClass('blue')
    ).toBeTruthy();
  });

  it('renders formatted Max, Avg, and Last values in the table body', () => {
    ['10.00%', '5.50%', '7.75%'].forEach(section => {
      expect(
        wrapper.containsMatchingElement(<Typography>{section}</Typography>)
      ).toBeTruthy();
    });
  });

  it('renders multiple rows', () => {
    wrapper.setProps({
      rows: [
        {
          legendTitle: 'Legend Title 1',
          legendColor: 'blue',
          data: mockMetrics,
          format: formatPercentage
        },
        {
          legendTitle: 'Legend Title 2',
          legendColor: 'red',
          data: { max: 80, average: 90, last: 100, total: 110 },
          format: formatPercentage
        }
      ]
    });
    expect(wrapper.find('[data-qa-legend-title]')).toHaveLength(2);
  });
});

describe('metrics by section', () => {
  const metrics = { max: 10, average: 5, last: 8, total: 80, length: 10 };
  expect(metricsBySection(metrics)).toHaveLength(3);
  expect(metricsBySection(metrics)).toBeInstanceOf(Array);
  expect(metricsBySection(metrics)[0]).toEqual(metrics.max);
  expect(metricsBySection(metrics)[1]).toEqual(metrics.average);
  expect(metricsBySection(metrics)[2]).toEqual(metrics.last);
});
