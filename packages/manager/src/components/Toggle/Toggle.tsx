import Switch, { SwitchProps } from '@mui/material/Switch';
import * as React from 'react';

import ToggleOff from 'src/assets/icons/toggleOff.svg';
import ToggleOn from 'src/assets/icons/toggleOn.svg';
import { TooltipIcon } from 'src/components/TooltipIcon';

export interface ToggleProps extends SwitchProps {
  /**
   * Makes a tooltip interactive (meaning the tooltip will not close when the user hovers over the tooltip). Note that in order for the tooltip to show up, tooltipText must be passed in as a prop.
   */
  interactive?: boolean;
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
  const { interactive, tooltipText, ...rest } = props;

  return (
    <React.Fragment>
      <Switch
        checkedIcon={<ToggleOn />}
        color="primary"
        data-qa-toggle={props.checked}
        icon={<ToggleOff />}
        {...rest}
      />
      {tooltipText && (
        <TooltipIcon
          interactive={interactive}
          status="help"
          text={tooltipText}
        />
      )}
    </React.Fragment>
  );
};
