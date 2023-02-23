import * as React from 'react';
import CopyTooltip from 'src/components/CopyTooltip';
import { makeStyles, Theme } from 'src/components/core/styles';
import TextField, { Props as TextFieldProps } from 'src/components/TextField';

const useStyles = makeStyles((theme: Theme) => ({
  removeDisabledStyles: {
    '& .MuiInput-input': {
      borderColor: theme.name === 'lightTheme' ? '#ccc' : '#222',
      color:
        theme.name === 'lightTheme'
          ? `${theme.palette.text.primary} !important`
          : '#fff !important',
      opacity: 1,
      '-webkit-text-fill-color': 'unset !important',
    },
    '& .MuiInput-root': {
      borderColor: theme.name === 'lightTheme' ? '#ccc' : '#222',
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

type Props = TextFieldProps & {
  className?: string;
  hideIcon?: boolean;
};

type CombinedProps = Props;

export const CopyableTextField: React.FC<React.PropsWithChildren<CombinedProps>> = (props) => {
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
