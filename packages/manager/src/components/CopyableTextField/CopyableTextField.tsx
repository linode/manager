import * as React from 'react';
import CopyTooltip from 'src/components/CopyTooltip';
import { makeStyles, Theme } from 'src/components/core/styles';
import TextField, { Props as TextFieldProps } from 'src/components/TextField';

const useStyles = makeStyles((theme: Theme) => ({
  removeDisabledStyles: {
    '&.Mui-disabled': {
      borderColor: theme.name === 'lightTheme' ? '#ccc' : '#222',
      color: theme.name === 'lightTheme' ? 'inherit' : '#fff !important',
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

interface Props extends TextFieldProps {
  className?: string;
  hideIcon?: boolean;
}

export const CopyableTextField = (props: Props) => {
  const classes = useStyles();
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

export default CopyableTextField;
