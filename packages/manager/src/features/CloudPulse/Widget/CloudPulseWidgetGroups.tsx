import { Tab, Tabs } from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useCloudPulseContext } from '../Context/useCloudPulseContext';
import { CloudPulseWidgetGroupToggles } from './CloudPulseWidgetGroupToggles';
import { RenderWidgets } from './CloudPulseWidgetRenderer';

import type { WidgetProps } from './CloudPulseWidgetRenderer';
import type { WidgetGroup, Widgets } from '@linode/api-v4';
import './CloudPulseWidgetGroupToggles.css';

export const CloudPulseWidgetGroups = React.memo((props: WidgetProps) => {
  const { dashboard } = props;
  const { setActiveWidgetGroup } = useCloudPulseContext();
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [visitedGroupIndexes, setVisitedGroupIndexes] = useState<Set<number>>(
    () => new Set([0])
  );

  // Single-pass processing: Sort widgets, build grouping Map, and derive names list
  const { sortedDashboard, widgetGroupNames, widgetGroups } = useMemo(() => {
    if (!dashboard.widgets?.length) {
      return {
        sortedDashboard: dashboard,
        widgetGroupNames: [],
        widgetGroups: undefined,
      };
    }

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
      widgetGroupNames: groups ? Array.from(groups.keys()) : [],
      widgetGroups: groups,
    };
  }, [dashboard]);

  const widgetGroupMaps = useMemo(
    () =>
      new Map<string, WidgetGroup>(
        (dashboard.widget_groups ?? []).map((group) => [group.name, group])
      ),
    [dashboard.widget_groups]
  );

  // Bounds-check tab index
  const activeWidgetGroupIndex =
    activeTabIndex < widgetGroupNames.length ? activeTabIndex : 0;

  // Sync tab change and visited status in a single state pass
  const handleTabsChange = useCallback(
    (event: CustomEvent<{ index: number }>) => {
      const newIndex = event.detail.index;
      setActiveTabIndex(newIndex);
      setVisitedGroupIndexes((prev) =>
        prev.has(newIndex) ? prev : new Set(prev).add(newIndex)
      );
    },
    []
  );

  // Sync active group to Context
  useEffect(() => {
    setActiveWidgetGroup(
      widgetGroups ? widgetGroupNames[activeWidgetGroupIndex] : undefined
    );
  }, [
    activeWidgetGroupIndex,
    setActiveWidgetGroup,
    widgetGroupNames,
    widgetGroups,
  ]);

  if (!widgetGroups) {
    return <RenderWidgets {...props} dashboard={sortedDashboard} />;
  }

  return (
    <Tabs
      border={false}
      onTabsChange={handleTabsChange}
      style={{ width: '100%' }}
      tabMaxWidth={420}
    >
      {widgetGroupNames.map((groupName, index) => {
        const isActive = activeWidgetGroupIndex === index;
        const isVisited = visitedGroupIndexes.has(index);

        return (
          <Tab
            active={isActive}
            data-pendo-id={`tab-${groupName}`}
            data-qa-id={`tab-${groupName}`}
            key={groupName}
            label={groupName}
            style={{ marginTop: `-${Spacing.S24}` }}
          >
            <span data-pendo-id={`tab-${groupName}`} slot="tab-header">
              {groupName}
            </span>
            {isVisited && (
              <div style={{ display: isActive ? undefined : 'none' }}>
                <CloudPulseWidgetGroupToggles
                  {...props}
                  isActiveGroup={isActive}
                  toggles={widgetGroupMaps.get(groupName)?.options?.toggles}
                  widgetGroup={groupName}
                  widgetGroups={widgetGroups}
                />
              </div>
            )}
          </Tab>
        );
      })}
    </Tabs>
  );
});
