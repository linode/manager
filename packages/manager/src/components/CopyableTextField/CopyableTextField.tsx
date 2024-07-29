import { styled } from '@mui/material/styles';
import * as React from 'react';

import {
  CopyTooltip,
  CopyTooltipProps,
} from 'src/components/CopyTooltip/CopyTooltip';
import { TextField, TextFieldProps } from 'src/components/TextField';

interface CopyableTextFieldProps extends TextFieldProps {
  /**
   * Optional props that are passed to the underlying CopyTooltip component
   */
  CopyTooltipProps?: Partial<CopyTooltipProps>;
  className?: string;
  hideIcon?: boolean;
}

export const CopyableTextField = (props: CopyableTextFieldProps) => {
  const { CopyTooltipProps, className, hideIcon, value, ...restProps } = props;

  return (
    <StyledTextField
      value={value}
      {...restProps}
      InputProps={{
        endAdornment: hideIcon ? undefined : (
          <CopyTooltip
            className="copyIcon"
            text={`${value}`}
            {...CopyTooltipProps}
          />
        ),
      }}
      className={`${className} copy removeDisabledStyles`}
      data-qa-copy-tooltip
      disabled
    />
  );
};

const StyledTextField = styled(TextField)(({ theme }) => ({
  '&.copy > div': {
    backgroundColor: theme.name === 'dark' ? '#2f3236' : '#f4f4f4',
    opacity: 1,
  },
  '.copyIcon': {
    '& svg': {
      height: 14,
      top: 1,
    },
    marginRight: theme.spacing(0.5),
  },
  '.removeDisabledStyles': {
    '& .MuiInput-input': {
      WebkitTextFillColor: 'unset !important',
      borderColor: theme.name === 'light' ? '#ccc' : '#222',
      color:
        theme.name === 'light'
          ? `${theme.palette.text.primary} !important`
          : '#fff !important',
      opacity: theme.name === 'dark' ? 0.5 : 0.8,
    },
    '&& .MuiInput-root': {
      borderColor: theme.name === 'light' ? '#ccc' : '#222',
      opacity: 1,
    },
  },
}));
