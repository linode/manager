import * as React from 'react';
import CopyTooltip from 'src/components/CopyTooltip';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
import TextField, { Props as TextFieldProps } from 'src/components/TextField';

const useStyles = makeStyles()((theme: Theme) => ({
  removeDisabledStyles: {
    '& .MuiInput-input': {
      borderColor: theme.name === 'light' ? '#ccc' : '#222',
      color:
        theme.name === 'light'
          ? `${theme.palette.text.primary} !important`
          : '#fff !important',
      opacity: 1,
      '-webkit-text-fill-color': 'unset !important',
    },
    '& .MuiInput-root': {
      borderColor: theme.name === 'light' ? '#ccc' : '#222',
      opacity: 1,
    },
  },
  copyIcon: {
    marginRight: theme.spacing(0.5),
    '& svg': {
      height: 14,
      top: 1,
    },
  },
}));

type CopyableTextFieldProps = TextFieldProps & {
  className?: string;
  hideIcon?: boolean;
};

export const CopyableTextField = (props: CopyableTextFieldProps) => {
  const { classes } = useStyles();
  const { value, className, hideIcon, ...restProps } = props;

  return (
    <TextField
      value={value}
      {...restProps}
      className={`${className} ${'copy'} ${classes.removeDisabledStyles}`}
      disabled
      InputProps={{
        endAdornment: hideIcon ? undefined : (
          <CopyTooltip text={`${value}`} className={classes.copyIcon} />
        ),
      }}
      data-qa-copy-tooltip
    />
  );
};
