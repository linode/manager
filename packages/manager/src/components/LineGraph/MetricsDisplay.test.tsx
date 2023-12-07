import { shallow } from 'enzyme';
import * as React from 'react';

import {
  MetricsDisplay,
  metricsBySection,
} from 'src/components/LineGraph/MetricsDisplay';
import { Typography } from 'src/components/Typography';
import { formatPercentage } from 'src/utilities/statMetrics';

describe('CPUMetrics', () => {
  const mockMetrics = {
    average: 5.5,
    last: 7.75,
    length: 3,
    max: 10,
    total: 40,
  };

  const wrapper = shallow(
    <MetricsDisplay
      rows={[
        {
          data: mockMetrics,
          format: formatPercentage,
          legendColor: 'blue',
          legendTitle: 'Legend Title',
        },
      ]}
    />
  );

  it('renders a table', () => {
    expect(wrapper.find('Table')).toHaveLength(1);
  });

  it('renders Max, Avg, and Last table headers', () => {
    ['Max', 'Avg', 'Last'].forEach((section) => {
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
    ['10.00%', '5.50%', '7.75%'].forEach((section) => {
      expect(
        wrapper.containsMatchingElement(<Typography>{section}</Typography>)
      ).toBeTruthy();
    });
  });

  it('renders multiple rows', () => {
    wrapper.setProps({
      rows: [
        {
          data: mockMetrics,
          format: formatPercentage,
          legendColor: 'blue',
          legendTitle: 'Legend Title 1',
        },
        {
          data: { average: 90, last: 100, max: 80, total: 110 },
          format: formatPercentage,
          legendColor: 'red',
          legendTitle: 'Legend Title 2',
        },
      ],
    });
    expect(wrapper.find('[data-qa-legend-title]')).toHaveLength(2);
  });
});

describe('metrics by section', () => {
  it('returns expected metric data', () => {
    const metrics = { average: 5, last: 8, length: 10, max: 10, total: 80 };
    expect(metricsBySection(metrics)).toHaveLength(3);
    expect(metricsBySection(metrics)).toBeInstanceOf(Array);
    expect(metricsBySection(metrics)[0]).toEqual(metrics.max);
    expect(metricsBySection(metrics)[1]).toEqual(metrics.average);
    expect(metricsBySection(metrics)[2]).toEqual(metrics.last);
  });
});
