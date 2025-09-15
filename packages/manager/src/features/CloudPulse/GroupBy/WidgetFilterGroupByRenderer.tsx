import { IconButton } from '@linode/ui';
import React from 'react';

import GroupByIcon from 'src/assets/icons/group-by.svg';

import { CloudPulseTooltip } from '../shared/CloudPulseTooltip';
import { CloudPulseGroupByDrawer } from './CloudPulseGroupByDrawer';
import { WIDGET_GROUP_BY_MESSAGE } from './constants';
import { useGlobalDimensions, useWidgetDimension } from './utils';

import type { GroupByOption } from './CloudPulseGroupByDrawer';
import type { CloudPulseServiceType } from '@linode/api-v4';

interface WidgetFilterGroupByRendererProps {
  /**
   * Id of the selected dashboard
   */
  dashboardId: number;
  /**
   * Callback function to handle the selected values
   */
  handleChange: (selectedValue: string[]) => void;
  /**
   * Label for the widget metric
   */
  label: string;
  /**
   * Name of the metric
   */
  metric: string;
  /**
   * Service type of the selected dashboard
   */
  serviceType: CloudPulseServiceType;
}

export const WidgetFilterGroupByRenderer = (
  props: WidgetFilterGroupByRendererProps
) => {
  const { metric, dashboardId, serviceType, label, handleChange } = props;
  const [isSelected, setIsSelected] = React.useState(false);

  const { isLoading: globalDimensionLoading, options: globalDimensions } =
    useGlobalDimensions(dashboardId, serviceType);
  const {
    isLoading: widgetDimensionLoading,
    options: widgetDimensions,
    defaultValue,
  } = useWidgetDimension(dashboardId, serviceType, globalDimensions, metric);
  const [open, setOpen] = React.useState(false);
  const onCancel = React.useCallback(() => {
    setOpen(false);
  }, []);
  const onApply = React.useCallback(
    (selectedValue: GroupByOption[]) => {
      if (selectedValue.length === 0) {
        setIsSelected(false);
      } else {
        setIsSelected(true);
      }
      handleChange(selectedValue.map(({ value }) => value));
      setOpen(false);
    },
    [handleChange, onCancel]
  );

  const isDisabled =
    globalDimensionLoading ||
    widgetDimensionLoading ||
    widgetDimensions.length === 0;

  return (
    <>
      <CloudPulseTooltip placement="bottom-end" title="Group By">
        <IconButton
          aria-label="Group By Dashboard Metrics"
          color="inherit"
          data-qa-selected={isSelected}
          data-testid="group-by"
          disabled={isDisabled}
          onClick={() => setOpen(true)}
          size="small"
          sx={(theme) => ({
            marginBlockEnd: 'auto',
            color: isSelected ? theme.color.buttonPrimaryHover : 'inherit',
            padding: 0,
          })}
        >
          <GroupByIcon height="24px" width="24px" />
        </IconButton>
      </CloudPulseTooltip>

      {!isDisabled && (
        <CloudPulseGroupByDrawer
          defaultValue={defaultValue}
          message={WIDGET_GROUP_BY_MESSAGE}
          onApply={onApply}
          onCancel={onCancel}
          open={open}
          options={widgetDimensions}
          serviceType={serviceType}
          subtitle={label}
          title="Group By"
        />
      )}
    </>
  );
};
