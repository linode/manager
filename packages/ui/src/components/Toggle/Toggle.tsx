import { SvgIcon } from '@mui/material';
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
  const { tooltipText, size = 'medium', sx, ...rest } = props;

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        overflow: 'visible',
      }}
    >
      <SvgIcon
        component={CheckMarkIcon}
        height="16px"
        sx={{
          position: 'absolute',
          top: size === 'medium' ? '20px' : '15.5px',
          left: size === 'medium' ? '22px' : tooltipText ? '18px' : '25px',
          fill: 'white',
          zIndex: 1,
          pointerEvents: 'none',
          opacity: props.checked ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
        viewBox="0 0 20 20"
        width="16px"
      />

      <Switch
        {...rest}
        checkedIcon={<ToggleOnIcon />}
        color="primary"
        data-qa-toggle={props.checked}
        icon={<ToggleOffIcon />}
        sx={{
          ...(size === 'small' && {
            '&& .icon': {
              height: 16,
              width: 16,
            },
            '.MuiSwitch-track': {
              opacity: '1 !important',
              height: 20,
              width: 40,
              borderRadius: 10,
            },
            '& .Mui-checked .icon': {
              left: '-6px',
            },
          }),
          overflow: 'visible',
          margin: '2px',
          ...sx,
        }}
      />
      {tooltipText && <TooltipIcon status="info" text={tooltipText} />}
    </Box>
  );
};
