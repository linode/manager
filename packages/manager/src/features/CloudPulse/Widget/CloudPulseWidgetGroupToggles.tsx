import {
  SegmentedButton,
  SegmentedButtonGroup,
} from '@akamai/cds-components/react';
import { Spacing, Typography } from '@akamai/cds-tokens';
import * as React from 'react';

import { useCloudPulseContext } from '../Context/useCloudPulseContext';
import { RenderWidgets } from './CloudPulseWidgetRenderer';
import './CloudPulseWidgetGroupToggles.css';

import type { WidgetProps } from './CloudPulseWidgetRenderer';
import type { WidgetGroupOptions, Widgets } from '@linode/api-v4';

interface Props extends WidgetProps {
  /**
   * The group associated with this set of toggles which is assigned to this widget group.
   */
  toggles?: WidgetGroupOptions[];
  /**
   * The name of the widget group associated with this set of toggles.
   */
  widgetGroup: string;
  /**
   * A map of all widget groups and their associated widgets.
   */
  widgetGroups: Map<string, Widgets[]>;
}

export const CloudPulseWidgetGroupToggles = React.memo(
  ({
    isActiveGroup = true,
    toggles,
    widgetGroup,
    widgetGroups,
    ...widgetProps
  }: Props) => {
    const { setGlobalGroupBy } = useCloudPulseContext();

    const selectedSegmentInitial = React.useMemo(() => {
      return toggles?.find((option) => option.is_checked)?.dimension;
    }, [toggles]);
    const [selectedSegment, setSelectedSegment] = React.useState(
      selectedSegmentInitial ?? ''
    );

    const handleChange = React.useCallback(
      (event: CustomEvent<{ value: string }>) => {
        const { value } = event.detail;
        setSelectedSegment(value);
      },
      []
    );

    React.useEffect(() => {
      if (!isActiveGroup) {
        return;
      }

      setGlobalGroupBy([
        toggles?.find(({ dimension }) => dimension === selectedSegment)?.name ??
          selectedSegment,
      ]);
    }, [isActiveGroup, selectedSegment, setGlobalGroupBy, toggles]);
    return (
      <>
        {toggles?.length && (
          <div
            className="cloud-pulse-widget-group-toggles"
            style={{
              gap: Spacing.S16,
              marginTop: Spacing.S24,
            }}
          >
            <h5
              style={{
                marginTop: Spacing.S2,
                font: Typography.Heading.S,
              }}
            >
              Metrics By
            </h5>
            <SegmentedButtonGroup
              onChange={handleChange}
              value={selectedSegment}
            >
              {toggles.map(({ dimension, name }) => (
                <SegmentedButton
                  data-pendo-id={`dimension-toggle-${dimension}`}
                  data-testid={`dimension-toggle-${dimension}`}
                  key={dimension}
                  value={dimension}
                >
                  {name}
                </SegmentedButton>
              ))}
            </SegmentedButtonGroup>
          </div>
        )}
        <RenderWidgets
          {...widgetProps}
          groupBy={
            toggles?.length && selectedSegment.length > 0
              ? [selectedSegment] // we need to club this global group by, if toggles are present
              : widgetProps.groupBy
          }
          isActiveGroup={isActiveGroup}
          widgetGroup={widgetGroup}
          widgetGroups={widgetGroups}
        />
      </>
    );
  }
);
