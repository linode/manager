// @todo: modularization - Import from 'ui' package once FormControlLabel is migrated.
import { FormControlLabel } from '@mui/material';
import _Checkbox from '@mui/material/Checkbox';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import {
  CheckboxCheckedIcon,
  CheckboxIcon,
  CheckboxIndeterminateIcon,
} from '../../assets/icons';
import { TooltipIcon } from '../TooltipIcon';

import type { CheckboxProps } from '@mui/material/Checkbox';
import type { SxProps, Theme } from '@mui/material/styles';

interface Props extends CheckboxProps {
  /**
   * Styles applied to the `FormControlLabel`. Only works when `text` is defined.
   */
  sxFormLabel?: SxProps<Theme>;
  /**
   * Renders a `FormControlLabel` that controls the underlying Checkbox with a label of `text`
   */
  text?: JSX.Element | string;
  /**
   * Renders a tooltip to the right of the Checkbox
   */
  toolTipText?: JSX.Element | string;
}

/**
 * ## Usage
 *
 * - Used when there are lists of options and the user may select any number of choices, including none, one, or many.
 * - A standalone checkbox is used for a single option that the user can turn on or off (i.e., accepting terms and conditions).
 *
 * ## Guidelines
 *
 * - Visually present groups of choices as groups, and clearly separate them from other groups on the same page.
 * - Lay out lists vertically, with one choice per line.
 * - Write checkbox labels so that users know what will happen if they check a particular box.
 * - Checkboxes often default to having none of the options selected.
 * - Changed settings should not take effect until the user clicks the action button.
 * - If the user clicks the Back button, any changes made to checkboxes should be discarded and the original settings reinstated.
 */
export const Checkbox = (props: Props) => {
  const { sxFormLabel, text, toolTipText, ...rest } = props;

  const BaseCheckbox = (
    <StyledCheckbox
      checkedIcon={<CheckboxCheckedIcon />}
      color="primary"
      data-qa-checked={props.checked}
      icon={<CheckboxIcon />}
      indeterminateIcon={<CheckboxIndeterminateIcon />}
      {...rest}
    />
  );

  const CheckboxComponent = props.text ? (
    <StyledFormControlLabel
      control={BaseCheckbox}
      label={text}
      sx={sxFormLabel}
    />
  ) : (
    BaseCheckbox
  );

  return (
    <>
      {CheckboxComponent}
      {toolTipText ? <TooltipIcon status="help" text={toolTipText} /> : null}
    </>
  );
};

const StyledCheckbox = styled(_Checkbox)(({ theme, ...props }) => ({
  '& .defaultFill': {
    transition: theme.transitions.create(['fill']),
  },
  '&:hover': {
    color: `${theme.tokens.checkbox.Empty.Hover.Border} !important`,
  },
  color: theme.tokens.checkbox.Empty.Default.Border,
  transition: theme.transitions.create(['color']),
  // Checked
  ...(props.checked && {
    color: `${theme.tokens.checkbox.Checked.Default.Background} !important`,
  }),
  // Indeterminate
  ...(props.indeterminate && {
    color: `${theme.tokens.checkbox.Indeterminated.Default.Background} !important`,
  }),
  // Unchecked & Disabled
  ...(props.disabled && {
    color: `${theme.tokens.checkbox.Empty.Disabled.Border} !important`,
    '& svg': {
      backgroundColor: theme.tokens.checkbox.Empty.Disabled.Background,
    },
    pointerEvents: 'none',
  }),
  // Checked & Disabled
  ...(props.checked &&
    props.disabled && {
      color: `${theme.tokens.checkbox.Checked.Disabled.Background} !important`,
    }),
  // Indeterminate & Disabled
  ...(props.indeterminate &&
    props.disabled && {
      color: `${theme.tokens.checkbox.Indeterminated.Disabled.Background} !important`,
    }),
  // ...(props.readOnly && {
  //   color: 'red !important',
  //   pointerEvents: 'none',
  // }),
  // '&.Mui-checked': {
  //   color: 'green !important', // Change color when checked
  // },
  // '&.Mui-disabled': {
  //   color: 'yellow', // Change color when disabled
  // },
  // '&.Mui-checked.Mui-disabled': {
  //   color: 'darkgray', // Change color when checked and disabled
  // },
}));

const StyledFormControlLabel = styled(FormControlLabel)(() => ({
  marginRight: 0,
}));
