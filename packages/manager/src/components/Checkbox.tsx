import * as React from 'react';
import { styled } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import CheckboxIcon from 'src/assets/icons/checkbox.svg';
import CheckboxCheckedIcon from 'src/assets/icons/checkboxChecked.svg';
import _Checkbox, { CheckboxProps } from '@mui/material/Checkbox';
import FormControlLabel from 'src/components/core/FormControlLabel';
import { TooltipIcon } from 'src/components/TooltipIcon/TooltipIcon';

interface Props extends CheckboxProps {
  text?: string | JSX.Element;
  toolTipText?: string | JSX.Element;
  toolTipInteractive?: boolean;
  sxFormLabel?: SxProps;
}

/**
 * ## Usage
 *
 * - Used when there are lists of options and the user may select any number of choices, including none, one, or many.
 * - A stand-alone checkbox is used for a single option that the user can turn on or off (ie. accepting terms and conditions).
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
  const { toolTipInteractive, toolTipText, text, sxFormLabel, ...rest } = props;

  const BaseCheckbox = (
    <StyledCheckbox
      color="primary"
      icon={<CheckboxIcon />}
      checkedIcon={<CheckboxCheckedIcon />}
      data-qa-checked={props.checked}
      {...rest}
    />
  );

  const CheckBoxComponent = props.text ? (
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
      {CheckBoxComponent}
      {toolTipText ? (
        <TooltipIcon
          interactive={toolTipInteractive}
          text={toolTipText}
          status="help"
        />
      ) : null}
    </>
  );
};

const StyledCheckbox = styled(_Checkbox)(({ theme, ...props }) => ({
  color: '#ccc',
  transition: theme.transitions.create(['color']),
  '& .defaultFill': {
    transition: theme.transitions.create(['fill']),
  },
  '&:hover': {
    color: theme.palette.primary.main,
  },
  ...(props.checked && {
    color: theme.palette.primary.main,
  }),
  ...(props.disabled && {
    color: '#ccc !important',
    fill: `${theme.bg.main} !important`,
    pointerEvents: 'none',
    '& .defaultFill': {
      opacity: 0.5,
      fill: `${theme.bg.main}`,
    },
  }),
}));

const StyledFormControlLabel = styled(FormControlLabel)(() => ({
  marginRight: 0,
}));
