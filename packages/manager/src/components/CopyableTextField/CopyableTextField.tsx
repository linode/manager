import * as React from 'react';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { styled } from '@mui/material/styles';
import TextField, { Props as TextFieldProps } from 'src/components/TextField';

type CopyableTextFieldProps = TextFieldProps & {
  className?: string;
  hideIcon?: boolean;
};

export const CopyableTextField = (props: CopyableTextFieldProps) => {
  const { value, className, hideIcon, ...restProps } = props;

  return (
    <StyledTextField
      value={value}
      {...restProps}
      className={`${className} copy removeDisabledStyles`}
      disabled
      InputProps={{
        endAdornment: hideIcon ? undefined : (
          <CopyTooltip text={`${value}`} className="copyIcon" />
        ),
      }}
      data-qa-copy-tooltip
    />
  );
};

const StyledTextField = styled(TextField)(({ theme }) => ({
  '.removeDisabledStyles': {
    '& .MuiInput-input': {
      borderColor: theme.name === 'light' ? '#ccc' : '#222',
      color:
        theme.name === 'light'
          ? `${theme.palette.text.primary} !important`
          : '#fff !important',
      opacity: theme.name === 'dark' ? 0.5 : 0.8,
      '-webkit-text-fill-color': 'unset !important',
    },
    '&& .MuiInput-root': {
      borderColor: theme.name === 'light' ? '#ccc' : '#222',
      opacity: 1,
    },
  },
  '.copyIcon': {
    marginRight: theme.spacing(0.5),
    '& svg': {
      height: 14,
      top: 1,
      color: '#3683dc',
    },
  },
  '&.copy > div': {
    backgroundColor: theme.name === 'dark' ? '#2f3236' : '#f4f4f4',
    opacity: 1,
  },
}));
