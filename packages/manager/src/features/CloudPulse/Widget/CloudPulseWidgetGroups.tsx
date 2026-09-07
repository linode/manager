import { Tab, Tabs } from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import React, { useMemo } from 'react';

import { RenderWidgets } from './CloudPulseWidgetRenderer';

import type { WidgetProps } from './CloudPulseWidgetRenderer';
import type { Widgets } from '@linode/api-v4';

export const CloudPulseWidgetGroups = React.memo((props: WidgetProps) => {
  const { dashboard } = props;

  // sort the widgets by widget_order and group them by widget_grouping
  const { sortedDashboard, widgetGroups } = useMemo(() => {
    const sortedWidgets = [...dashboard.widgets].sort(
      (widgetA, widgetB) =>
        (widgetA.widget_order ?? 0) - (widgetB.widget_order ?? 0)
    );
    let groups: Map<string, Widgets[]> | undefined;

    for (const widget of sortedWidgets) {
      const groupName = widget.widget_grouping;
      if (!groupName) {
        continue;
      }

      groups ??= new Map<string, Widgets[]>();
      const currentGroup = groups.get(groupName);
      if (currentGroup) {
        currentGroup.push(widget);
      } else {
        groups.set(groupName, [widget]);
      }
    }

    return {
      sortedDashboard: { ...dashboard, widgets: sortedWidgets },
      widgetGroups: groups,
    };
  }, [dashboard]);

  if (!widgetGroups) {
    return <RenderWidgets {...props} dashboard={sortedDashboard} />;
  }

  return (
    <Tabs border={false} style={{ paddingLeft: Spacing.S24, width: '100%' }}>
      {Array.from(widgetGroups.keys()).map((groupName) => (
        <Tab
          key={groupName}
          label={groupName}
          style={{
            marginTop: `-${Spacing.S24}`,
          }}
        >
          <span data-pendo-id={`tab-${groupName}`} slot="tab-header">
            {groupName}
          </span>
          <RenderWidgets
            {...props}
            widgetGroup={groupName}
            widgetGroups={widgetGroups}
          />
        </Tab>
      ))}
    </Tabs>
  );
});
