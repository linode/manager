import { styled } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import * as React from 'react';
import CheckboxIcon from 'src/assets/icons/checkbox.svg';
import CheckboxCheckedIcon from 'src/assets/icons/checkboxChecked.svg';
import Checkbox, { CheckboxProps } from 'src/components/core/Checkbox';
import FormControlLabel from 'src/components/core/FormControlLabel';
import { TooltipIcon } from 'src/components/TooltipIcon/TooltipIcon';

interface Props extends CheckboxProps {
  text?: string | JSX.Element;
  toolTipText?: string | JSX.Element;
  toolTipInteractive?: boolean;
  sxFormLabel?: SxProps;
}

const LinodeCheckBox = (props: Props) => {
  const { sxFormLabel, text, toolTipInteractive, toolTipText, ...rest } = props;

  if (props.text) {
    return (
      <>
        <StyledFormControlLabel
          control={
            <StyledCheckbox
              color="primary"
              icon={<CheckboxIcon />}
              checkedIcon={<CheckboxCheckedIcon />}
              data-qa-checked={props.checked}
              {...rest}
            />
          }
          label={text}
          sx={sxFormLabel}
        />
        {toolTipText ? (
          <TooltipIcon
            interactive={toolTipInteractive}
            text={toolTipText}
            status="help"
          />
        ) : null}
      </>
    );
  }

  return (
    <StyledCheckbox
      color="primary"
      icon={<CheckboxIcon />}
      checkedIcon={<CheckboxCheckedIcon />}
      data-qa-checked={props.checked}
      {...rest}
    />
  );
};

export default LinodeCheckBox;

const StyledCheckbox = styled(Checkbox)(({ theme, ...props }) => ({
  '& .defaultFill': {
    transition: theme.transitions.create(['fill']),
  },
  '&:hover': {
    color: theme.palette.primary.main,
  },
  color: '#ccc',
  transition: theme.transitions.create(['color']),
  ...(props.checked && {
    color: theme.palette.primary.main,
  }),
  ...(props.disabled && {
    '& .defaultFill': {
      fill: `${theme.bg.main}`,
      opacity: 0.5,
    },
    color: '#ccc !important',
    fill: `${theme.bg.main} !important`,
    pointerEvents: 'none',
  }),
}));

const StyledFormControlLabel = styled(FormControlLabel)(() => ({
  marginRight: 0,
}));
