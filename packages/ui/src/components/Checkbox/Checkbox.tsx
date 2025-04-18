import _Checkbox from '@mui/material/Checkbox';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import {
  CheckboxCheckedIcon,
  CheckboxIcon,
  CheckboxIndeterminateIcon,
} from '../../assets/icons';
import { FormControlLabel } from '../FormControlLabel';
import { TooltipIcon } from '../TooltipIcon';

import type { CheckboxProps } from '@mui/material/Checkbox';
import type { SxProps, Theme } from '@mui/material/styles';

interface Props extends CheckboxProps {
  /**
   * New custom size prop (Overides and restrict 'size' to only 'small' and 'medium' per ADS)
   *
   * @default medium
   */
  size?: 'medium' | 'small';
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

const StyledCheckbox = styled(_Checkbox, {
  label: 'StyledCheckbox',
})(({ theme, ...props }) => ({
  '& .defaultFill': {
    transition: theme.transitions.create(['fill']),
  },
  padding: theme.tokens.spacing.S8,
  transition: theme.transitions.create(['color']),
  // Unchecked & Readonly
  ...(props.readOnly && {
    color: theme.tokens.component.Checkbox.Empty.ReadOnly.Border,
    pointerEvents: 'none',
  }),
  // Checked & Readonly
  ...(props.checked &&
    props.readOnly && {
      svg: {
        '#Check': {
          fill: theme.tokens.component.Checkbox.Checked.ReadOnly.Icon,
        },
        border: `1px solid ${theme.tokens.component.Checkbox.Checked.ReadOnly.Border}`,
      },
      color: `${theme.tokens.component.Checkbox.Checked.ReadOnly.Background} !important`,
      pointerEvents: 'none',
    }),
  // Indeterminate & Readonly
  ...(props.indeterminate &&
    props.readOnly && {
      svg: {
        'g rect:nth-of-type(2)': {
          fill: theme.tokens.component.Checkbox.Indeterminated.ReadOnly.Icon,
        },
        border: `1px solid ${theme.tokens.component.Checkbox.Indeterminated.ReadOnly.Border}`,
      },
      color: `${theme.tokens.component.Checkbox.Checked.ReadOnly.Background} !important`,
      pointerEvents: 'none',
    }),
}));

const StyledFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
  '& .MuiFormControlLabel-label': {
    paddingTop: theme.tokens.spacing.S2,
  },
  marginRight: 0,
}));
