import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
import type { WidgetGroup, Widgets } from '@linode/api-v4';

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
  SegmentedButton: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => (
    <button type="button" value={value}>
      {children}
    </button>
  ),
  SegmentedButtonGroup: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Tabs: ({
    children,
    onTabsChange,
  }: {
    children: React.ReactNode;
    onTabsChange: (event: CustomEvent<{ index: number }>) => void;
  }) => (
    <div aria-label="tabs">
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement<{ label: string }>(child)) {
          return child;
        }

        return (
          <React.Fragment key={child.props.label}>
            <button
              onClick={() =>
                onTabsChange(
                  new CustomEvent('tabs-change', { detail: { index } })
                )
              }
              role="tab"
              type="button"
            >
              {child.props.label}
            </button>
            {child}
          </React.Fragment>
        );
      })}
    </div>
  ),
}));

vi.mock('./CloudPulseWidgetRenderer', () => ({
  RenderWidgets: ({
    dashboard,
    groupBy,
    widgetGroup,
    widgetGroups,
  }: WidgetProps) => {
    const widgets =
      widgetGroup && widgetGroups
        ? (widgetGroups.get(widgetGroup) ?? [])
        : dashboard.widgets;

    return (
      <div aria-label={widgetGroup ? `widgets-${widgetGroup}` : 'widgets'}>
        <span>Group by: {groupBy.join(',')}</span>
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

const createProps = (
  widgets: Widgets[],
  widgetGroups?: WidgetGroup[]
): WidgetProps => ({
  ...props,
  dashboard: { ...props.dashboard, widget_groups: widgetGroups, widgets },
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

  it('renders only the active group widgets in widget order', async () => {
    const groupAWidgetsLabel = 'widgets-Group A';
    const groupBWidgetsLabel = 'widgets-Group B';
    const user = userEvent.setup();
    const { getByLabelText, getAllByRole, getByRole, queryByLabelText } =
      renderWithTheme(
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
      within(getByLabelText(groupBWidgetsLabel)).getByText('Group B first')
    ).toBeInTheDocument();
    expect(getByLabelText(groupBWidgetsLabel)).toBeVisible();
    expect(queryByLabelText(groupAWidgetsLabel)).not.toBeInTheDocument();

    await user.click(getByRole('tab', { name: 'Group A' }));

    expect(getByLabelText(groupBWidgetsLabel)).not.toBeVisible();
    expect(getByLabelText(groupAWidgetsLabel)).toBeVisible();
    expect(getByLabelText(groupAWidgetsLabel)).toHaveTextContent(
      'Group A firstGroup A later'
    );
  });

  it('uses the first toggle dimension for each group', async () => {
    const user = userEvent.setup();
    const { getByLabelText, getByRole } = renderWithTheme(
      <CloudPulseWidgetGroups
        {...createProps(
          [
            createWidget('Group A widget', 1, 'Group A'),
            createWidget('Group B widget', 2, 'Group B'),
          ],
          [
            {
              group_by_type: 'toggles',
              name: 'Group A',
              options: {
                toggles: [
                  { dimension: 'region', is_checked: true, name: 'Region' },
                ],
              },
            },
            {
              group_by_type: 'toggles',
              name: 'Group B',
              options: {
                toggles: [
                  { dimension: 'status', is_checked: true, name: 'Status' },
                ],
              },
            },
          ]
        )}
      />
    );

    expect(getByLabelText('widgets-Group A')).toHaveTextContent(
      'Group by: region'
    );

    await user.click(getByRole('tab', { name: 'Group B' }));

    expect(getByLabelText('widgets-Group B')).toHaveTextContent(
      'Group by: status'
    );
  });
});
