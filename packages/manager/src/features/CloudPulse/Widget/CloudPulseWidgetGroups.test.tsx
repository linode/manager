import { within } from '@testing-library/react';
import { DateTime } from 'luxon';
import React from 'react';

import {
  dashboardFactory,
  logsMetricCriteria,
  widgetFactory,
} from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseWidgetGroups } from './CloudPulseWidgetGroups';

import type { WidgetProps } from './CloudPulseWidgetRenderer';
import type { Widgets } from '@linode/api-v4';

const props: WidgetProps = {
  additionalFilters: [],
  dashboard: dashboardFactory.build(),
  duration: {
    end: DateTime.now().toISO(),
    preset: '30minutes',
    start: DateTime.now().minus({ minutes: 30 }).toISO(),
  },
  isJweTokenFetching: false,
  resources: ['1', '2'],
  savePref: true,
  groupBy: [],
  resourceList: [],
  metricDefinitions: {
    data: logsMetricCriteria,
    page: 1,
    pages: 1,
    results: 1,
  },
};

vi.mock('@akamai/cds-components/react', () => ({
  Tab: ({ children, label }: { children: React.ReactNode; label: string }) => (
    <section aria-label={`tab-${label}`}>
      <h2>{label}</h2>
      {children}
    </section>
  ),
  Tabs: ({ children }: { children: React.ReactNode }) => (
    <div aria-label="tabs">{children}</div>
  ),
}));

vi.mock('./CloudPulseWidgetRenderer', () => ({
  RenderWidgets: ({ dashboard, widgetGroup, widgetGroups }: WidgetProps) => {
    const widgets =
      widgetGroup && widgetGroups
        ? (widgetGroups.get(widgetGroup) ?? [])
        : dashboard.widgets;

    return (
      <div aria-label={widgetGroup ? `widgets-${widgetGroup}` : 'widgets'}>
        {widgets.map((widget) => (
          <span key={widget.label}>{widget.label}</span>
        ))}
      </div>
    );
  },
}));

const createWidget = (
  label: string,
  widgetOrder: number,
  widgetGrouping?: string
): Widgets =>
  widgetFactory.build({
    label,
    widget_order: widgetOrder,
    widget_grouping: widgetGrouping,
  });

const createProps = (widgets: Widgets[]): WidgetProps => ({
  ...props,
  dashboard: { ...props.dashboard, widgets },
});

describe('CloudPulseWidgetGroups', () => {
  it('renders ungrouped widgets in widget order', () => {
    const { getByLabelText, queryByLabelText } = renderWithTheme(
      <CloudPulseWidgetGroups
        {...createProps([
          createWidget('Third', 3),
          createWidget('First', 1),
          createWidget('Second', 2),
        ])}
      />
    );

    expect(getByLabelText('widgets')).toHaveTextContent('FirstSecondThird');
    expect(queryByLabelText('tabs')).not.toBeInTheDocument();
  });

  it('renders groups and their widgets in widget order', () => {
    const { getByLabelText, getAllByRole } = renderWithTheme(
      <CloudPulseWidgetGroups
        {...createProps([
          createWidget('Group B later', 4, 'Group B'),
          createWidget('Group A later', 3, 'Group A'),
          createWidget('Group B first', 1, 'Group B'),
          createWidget('Group A first', 2, 'Group A'),
        ])}
      />
    );

    const groupTabs = getAllByRole('heading');
    expect(groupTabs[0]).toHaveTextContent('Group B');
    expect(groupTabs[1]).toHaveTextContent('Group A');
    expect(
      within(getByLabelText('widgets-Group B')).getByText('Group B first')
    ).toBeInTheDocument();
    expect(getByLabelText('widgets-Group A')).toHaveTextContent(
      'Group A firstGroup A later'
    );
  });
});
