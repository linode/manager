import * as classNames from 'classnames';
import * as React from 'react';
import FormHelperText from 'src/components/core/FormHelperText';
import Input, { InputProps } from 'src/components/core/Input';
import Select, { SelectProps } from 'src/components/core/Select';
import { makeStyles, Theme } from 'src/components/core/styles';
import HelpIcon from 'src/components/HelpIcon';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'relative'
  },
  inputError: {
    borderColor: `${theme.color.red} !important`,
    '&[class*="focused"]': {
      borderColor: theme.color.red
    }
  },
  textError: {
    marginTop: theme.spacing(1),
    color: theme.color.red,
    fontSize: '0.8rem',
    minHeight: '1em',
    lineHeight: '1em'
  },
  inputSucess: {
    borderColor: `${theme.color.green} !important`,
    '&[class*="focused"]': {
      borderColor: theme.color.green
    },
    '& + p': {
      color: theme.color.green
    }
  },
  helpWrapper: {
    display: 'flex',
    alignItems: 'flex-end'
  },
  helpWrapperSelectField: {
    width: 415,
    [theme.breakpoints.down('xs')]: {
      width: '100%'
    }
  },
  small: {
    minHeight: 32,
    '& [role="button"]': {
      minHeight: 32,
      padding: '8px 32px 0 8px',
      minWidth: 132
    },
    '& svg': {
      marginTop: 0,
      width: 24,
      height: 24
    }
  }
}));

interface Props extends SelectProps {
  tooltipText?: string;
  success?: boolean;
  open?: boolean;
  errorText?: string;
  errorGroup?: string;
  small?: boolean;
  className?: any;
}

type CombinedProps = Props;

const SSelect: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const {
    children,
    success,
    error,
    tooltipText,
    errorText,
    className,
    small
  } = props;

  const inputProps: InputProps = {
    disableUnderline: true,
    fullWidth: true
  };

  const c = classNames(
    {
      [classes.inputSucess]: success === true,
      [classes.inputError]: error === true,
      [classes.helpWrapperSelectField]: Boolean(tooltipText),
      [classes.small]: small
    },
    className
  );

  return (
    <React.Fragment>
      <div
        className={classNames({
          [classes.root]: true,
          [classes.helpWrapper]: Boolean(tooltipText)
        })}
      >
        <Select
          native
          open={props.open}
          className={c}
          input={<Input {...inputProps} />}
          {...props}
          data-qa-select
        >
          {children}
        </Select>
        {tooltipText && <HelpIcon text={tooltipText} />}
      </div>
      {errorText && (
        <FormHelperText className={classes.textError}>
          {errorText}
        </FormHelperText>
      )}
    </React.Fragment>
  );
};

export default SSelect as React.ComponentType<Props>;
