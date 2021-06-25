import * as React from 'react';
import CopyTooltip from 'src/components/CopyTooltip';
import { makeStyles, Theme } from 'src/components/core/styles';
import TextField, { Props as TextFieldProps } from 'src/components/TextField';

const useStyles = makeStyles((theme: Theme) => ({
  input: {
    backgroundColor: theme.bg.offWhite,
  },
  copyIcon: {
    marginRight: theme.spacing(0.5),
    '& svg': {
      height: 14,
    },
  },
}));

type Props = TextFieldProps & {
  className?: string;
  hideIcon?: boolean;
};

type CombinedProps = Props;

export const CopyableTextField: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const { value, className, hideIcon, ...restProps } = props;

  return (
    <TextField
      value={value}
      {...restProps}
      className={`${className} ${'copy'}`}
      data-qa-copy-tooltip
      InputProps={{
        endAdornment: hideIcon ? undefined : (
          <CopyTooltip text={`${value}`} className={classes.copyIcon} />
        ),
      }}
    />
  );
};

export default CopyableTextField;
