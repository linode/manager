import { SvgIcon, SxProps, Theme } from '@mui/material';
import Switch from '@mui/material/Switch';
import * as React from 'react';
import type { JSX } from 'react';

import { CheckMarkIcon, ToggleOffIcon, ToggleOnIcon } from '../../assets/icons';
import { Box } from '../Box';
import { TooltipIcon } from '../TooltipIcon';

import type { SwitchProps } from '@mui/material/Switch';

export interface ToggleProps extends SwitchProps {
  /**
   * Content to display inside an optional tooltip.
   */
  tooltipText?: JSX.Element | string;
}

const checkedIcon = (
  <Box sx={{ display: 'flex', gap: 0.5, marginLeft: '-16px' }}>
    <SvgIcon
      component={CheckMarkIcon}
      height="20px"
      sx={{
        mt: 0.15,
        fill: 'white',
      }}
      viewBox="0 0 20 20"
      width="20px"
    />
    <ToggleOnIcon />
  </Box>
);

/**
 * ## Usage
 *
 * Toggles are best used for changing the state of system functionalities and preferences. Toggles may replace two radio buttons or a single checkbox to allow users to choose between two opposing states.
 * - Toggles should take immediate effect and should not require the user to click Save or Submit.
 * - Keep labels for toggles short and direct.
 * - Toggle switches should be used instead of radio buttons if each item in a set can be independently controlled.
 * - The Toggle component extends the [Material UI Switch props](https://v4.mui.com/api/switch/#props).
 *
 * > **Note:** Do not use toggles in long forms where other types of form fields are present, and users will need to click a Submit button for other changes to take effect. This scenario confuses users because they can’t be sure whether their toggle choice will take immediate effect.
 */
export const Toggle = (props: ToggleProps) => {
  const { tooltipText, size, sx, ...rest } = props;

  const smallSizeOverrides: SxProps<Theme> =
    size === 'small'
      ? {
          '& .icon': {
            borderRadius: '50%',
            height: 16,
            top: -2,
            left: -2,
            position: 'relative',
            transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
            width: 16,
          },
          '.MuiSwitch-track': {
            opacity: '1 !important',
            height: 20,
            width: 40,
            borderRadius: 10,
          },
          '& .Mui-checked .icon': {
            left: '-10px',
          },
        }
      : {};

  return (
    <React.Fragment>
      <Switch
        checkedIcon={checkedIcon}
        color="primary"
        data-qa-toggle={props.checked}
        icon={<ToggleOffIcon />}
        {...rest}
        sx={{
          ...smallSizeOverrides,
          ...sx,
        }}
      />
      {tooltipText && <TooltipIcon status="help" text={tooltipText} />}
    </React.Fragment>
  );
};
