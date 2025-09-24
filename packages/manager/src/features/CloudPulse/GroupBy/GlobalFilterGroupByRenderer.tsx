import { IconButton } from '@linode/ui';
import React from 'react';

import GroupByIcon from 'src/assets/icons/group-by.svg';

import { CloudPulseTooltip } from '../shared/CloudPulseTooltip';
import { CloudPulseGroupByDrawer } from './CloudPulseGroupByDrawer';
import { GLOBAL_GROUP_BY_MESSAGE } from './constants';
import { useGlobalDimensions } from './utils';

import type { GroupByOption } from './CloudPulseGroupByDrawer';
import type { Dashboard, FilterValue } from '@linode/api-v4';

interface GlobalFilterGroupByRendererProps {
  /**
   * Callback to handle the selected values
   */
  handleChange: (selectedValue: string[], savePref?: boolean) => void;
  /**
   * User's saved group by preference
   */
  preferenceGroupBy?: FilterValue;
  /**
   * Indicates whether to save the selected group by options to user preferences
   */
  savePreferences?: boolean;
  /**
   * Currently selected dashboard
   */
  selectedDashboard?: Dashboard;
}

export const GlobalFilterGroupByRenderer = (
  props: GlobalFilterGroupByRendererProps
) => {
  const {
    selectedDashboard,
    handleChange,
    preferenceGroupBy,
    savePreferences,
  } = props;
  const [isSelected, setIsSelected] = React.useState(false);

  const { options, defaultValue, isLoading } = useGlobalDimensions(
    selectedDashboard?.id,
    selectedDashboard?.service_type,
    preferenceGroupBy as string[]
  );

  const [open, setOpen] = React.useState(false);

  const onApply = React.useCallback(
    (selectedValue: GroupByOption[]) => {
      if (selectedValue.length === 0) {
        setIsSelected(false);
      } else {
        setIsSelected(true);
      }
      handleChange(
        selectedValue.map(({ value }) => value),
        savePreferences
      );
      setOpen(false);
    },
    [handleChange, savePreferences]
  );

  const onCancel = React.useCallback(() => {
    setOpen(false);
  }, []);
  return (
    <>
      <CloudPulseTooltip placement="bottom-end" title="Group By">
        <IconButton
          aria-label="Group By Dashboard Metrics"
          color="inherit"
          data-qa-selected={isSelected}
          data-testid="group-by"
          disabled={!selectedDashboard || isLoading}
          onClick={() => setOpen(true)}
          size="small"
          sx={(theme) => ({
            marginBlockEnd: 'auto',
            marginTop: { md: theme.spacingFunction(28) },
            color: isSelected
              ? theme.tokens.component.Button.Primary.Hover.Background
              : 'inherit',
          })}
        >
          <GroupByIcon height="24px" width="24px" />
        </IconButton>
      </CloudPulseTooltip>

      {!isLoading && selectedDashboard && (
        <CloudPulseGroupByDrawer
          defaultValue={defaultValue}
          message={GLOBAL_GROUP_BY_MESSAGE}
          onApply={onApply}
          onCancel={onCancel}
          open={open}
          options={options}
          serviceType={selectedDashboard.service_type}
          subtitle={selectedDashboard.label}
          title="Global Group By"
        />
      )}
    </>
  );
};
