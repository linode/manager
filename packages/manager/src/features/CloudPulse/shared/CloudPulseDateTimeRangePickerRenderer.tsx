import { Box, Button, CalendarIcon, DateTimeRangePicker } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import React from 'react';

import { CloudPulseDateTimeRangePicker } from './CloudPulseDateTimeRangePicker';

import type { CloudPulseDateTimeRangePickerProps } from './CloudPulseDateTimeRangePicker';

interface CloudPulseDateTimeRangePickerRendererProps
  extends CloudPulseDateTimeRangePickerProps {
  /**
   * Disables the date time range picker and shows a disabled button with the default preset value.
   */
  isDisabled?: boolean;
}

export const CloudPulseDateTimeRangePickerRenderer = React.memo(
  (props: CloudPulseDateTimeRangePickerRendererProps) => {
    const { isDisabled } = props;
    const theme = useTheme();

    if (isDisabled) {
      // render a disabled button with the default preset value when the date time range picker is disabled
      return (
        <Box alignItems="center" display="flex">
          <Button
            buttonType="secondary"
            data-testid="preset-button"
            disabled
            endIcon={
              <CalendarIcon
                color={theme.tokens.alias.Content.Icon.Primary.Disabled}
                height={24}
                width={24}
              />
            }
            sx={{
              marginTop: 3.5,
              bottom: (theme) => theme.spacingFunction(2),
            }}
          >
            {DateTimeRangePicker.PRESET_LABELS.LAST_HOUR}
          </Button>
        </Box>
      );
    }

    return <CloudPulseDateTimeRangePicker {...props} />;
  }
);
