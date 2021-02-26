import Caret from '@material-ui/icons/KeyboardArrowDown';
import * as classNames from 'classnames';
import * as React from 'react';
import FormControl from 'src/components/core/FormControl';
import FormHelperText from 'src/components/core/FormHelperText';
import Input, { InputProps } from 'src/components/core/Input';
import InputLabel from 'src/components/core/InputLabel';
import Select, { SelectProps } from 'src/components/core/Select';
import { makeStyles, Theme } from 'src/components/core/styles';
import HelpIcon from 'src/components/HelpIcon';
import { convertToKebabCase } from 'src/utilities/convertToKebobCase';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'relative',
  },
  inputError: {
    borderColor: `${theme.color.red} !important`,
    '&[class*="focused"]': {
      borderColor: theme.color.red,
    },
  },
  textError: {
    marginTop: theme.spacing(1),
    color: theme.color.red,
    fontSize: '0.8rem',
    minHeight: '1em',
    lineHeight: '1em',
  },
  helpWrapper: {
    display: 'flex',
    alignItems: 'flex-end',
  },
  helpWrapperSelectField: {
    width: 415,
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
  small: {
    minHeight: 32,
    '& [role="button"]': {
      minHeight: 32,
      padding: '8px 32px 0 8px',
      minWidth: 132,
    },
    '& svg': {
      marginTop: 0,
      width: 24,
      height: 24,
    },
  },
}));

interface Props extends SelectProps {
  label: string;
  options?: Array<OptionProps>;
  fullWidth?: boolean;
  tooltipText?: string;
  open?: boolean;
  errorText?: string;
  small?: boolean;
  className?: any;
  hideLabel?: boolean;
}

interface OptionProps {
  label: string;
  value?: string | number;
}

type CombinedProps = Props;

const SSelect: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const {
    label,
    options,
    value,
    hideLabel,
    fullWidth,
    children,
    error,
    tooltipText,
    errorText,
    className,
    small,
    ...rest
  } = props;

  const inputProps: InputProps = {
    disableUnderline: true,
    fullWidth: true,
  };

  const c = classNames(
    {
      [classes.inputError]: error === true,
      [classes.helpWrapperSelectField]: Boolean(tooltipText),
      [classes.small]: small,
    },
    className
  );

  // Default to `true` if this prop hasn't been defined.
  // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#nullish-coalescing
  const _fullWidth = fullWidth ?? true;

  return (
    <FormControl fullWidth={_fullWidth}>
      <div
        className={classNames({
          [classes.root]: true,
          [classes.helpWrapper]: Boolean(tooltipText),
        })}
      >
        <InputLabel
          className={classNames({
            'visually-hidden': hideLabel,
          })}
          htmlFor={convertToKebabCase(label)}
          disableAnimation
          shrink
          data-testid="native-select-label"
        >
          {label}
        </InputLabel>
        <Select
          native
          open={props.open}
          className={c}
          input={<Input {...inputProps} />}
          {...rest}
          data-qa-select
          id={convertToKebabCase(label)}
          IconComponent={Caret}
          data-testid="native-select"
          value={value}
        >
          {options
            ? options.map((option, i) => {
                const { label: optionLabel, value: optionValue } = option;
                const finalVal = optionValue ? optionValue : i;
                return (
                  <option
                    key={i}
                    value={finalVal}
                    aria-selected={value === finalVal ? true : undefined}
                  >
                    {optionLabel}
                  </option>
                );
              })
            : children}
        </Select>
        {tooltipText && <HelpIcon text={tooltipText} />}
      </div>
      {errorText && (
        <FormHelperText className={classes.textError}>
          {errorText}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default SSelect as React.ComponentType<Props>;
