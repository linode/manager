import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import classNames from 'classnames';
import { clamp } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import FormHelperText from 'src/components/core/FormHelperText';
import InputAdornment from 'src/components/core/InputAdornment';
import InputLabel from 'src/components/core/InputLabel';
import { makeStyles, Theme, WithTheme } from 'src/components/core/styles';
import TextField, { TextFieldProps } from 'src/components/core/TextField';
import HelpIcon from 'src/components/HelpIcon';
import { convertToKebabCase } from 'src/utilities/convertToKebobCase';

const useStyles = makeStyles((theme: Theme) => ({
  helpWrapper: {
    display: 'flex',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  },
  wrapper: {
    marginTop: theme.spacing(2),
  },
  noTransform: {
    transform: 'none',
  },
  label: {
    fontFamily: theme.font.normal,
  },
  helperTextTop: {
    marginBottom: theme.spacing(),
    marginTop: theme.spacing(),
  },
  helpWrapperContainer: {
    display: 'flex',
    width: '100%',
  },
  expand: {
    maxWidth: '100%',
  },
  root: {
    marginTop: 0,
  },
  helpWrapperTextField: {
    width: 415,
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
  helpIcon: {
    padding: '0px 0px 0px 8px',
  },
  errorText: {
    display: 'flex',
    alignItems: 'center',
    color: theme.color.red,
    top: 42,
    left: 5,
    width: '100%',
  },
  editable: {
    wordBreak: 'keep-all',
    paddingLeft: 1,
  },
  absolute: {
    position: 'absolute',
  },
}));

interface BaseProps {
  className?: any;
  dataAttrs?: Record<string, any>;
  editable?: boolean;
  errorGroup?: string;
  errorText?: string;
  expand?: boolean;
  hasAbsoluteError?: boolean;
  helperTextPosition?: 'top' | 'bottom';
  hideLabel?: boolean;
  inputId?: string;
  loading?: boolean;
  /**
   * The number amounts allowed in TextField and
   * the "type" prop must also be set to "number"
   */
  max?: number;
  min?: number;
  noMarginTop?: boolean;
  optional?: boolean;
  required?: boolean;
  tooltipPosition?:
    | 'bottom'
    | 'bottom-end'
    | 'bottom-start'
    | 'left-end'
    | 'left-start'
    | 'left'
    | 'right-end'
    | 'right-start'
    | 'right'
    | 'top-end'
    | 'top-start'
    | 'top';
  tooltipText?: string | JSX.Element;
  tooltipClasses?: string;
  tooltipOnMouseEnter?: React.MouseEventHandler<HTMLDivElement> | undefined;
  value?: Value;
}

type Value = string | number | undefined | null;

interface TextFieldPropsOverrides extends TextFieldProps {
  // We override this prop to make it required
  label: string;
}

export type Props = BaseProps & TextFieldProps & TextFieldPropsOverrides;

type CombinedProps = Props & WithTheme;

export const LinodeTextField: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const {
    children,
    className,
    dataAttrs,
    editable,
    error,
    errorGroup,
    errorText,
    expand,
    hasAbsoluteError,
    helperText,
    helperTextPosition,
    hideLabel,
    inputId,
    InputLabelProps,
    inputProps,
    InputProps,
    label,
    loading,
    max,
    min,
    noMarginTop,
    onChange,
    optional,
    required,
    SelectProps,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    theme,
    tooltipPosition,
    tooltipText,
    tooltipClasses,
    tooltipOnMouseEnter,
    type,
    value,
    ...textFieldProps
  } = props;

  const [_value, setValue] = React.useState<Value>(value);

  React.useEffect(() => {
    setValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numberTypes = ['tel', 'number'];

    // Because !!0 is falsy :(
    const minAndMaxExist = typeof min === 'number' && typeof max === 'number';

    /**
     * If we've provided a min and max value, make sure the user
     * input doesn't go outside of those bounds ONLY if the input
     * type matches a number type.
     */
    const cleanedValue =
      minAndMaxExist &&
      numberTypes.some((eachType) => eachType === type) &&
      e.target.value !== ''
        ? clamp(min, max, +e.target.value)
        : e.target.value;

    /**
     * If the cleanedValue is undefined, set the value to an empty
     * string but this shouldn't happen.
     */
    setValue(cleanedValue || '');

    // Invoke the onChange prop if one is provided with the cleaned value.
    if (onChange) {
      /**
       * Create clone of event node only if our cleanedValue
       * is different from the e.target.value
       *
       * This solves for a specific scenario where the e.target on
       * the MUI TextField select variants were actually a plain object
       * rather than a DOM node.
       *
       * So e.target on a text field === <input />
       * while e.target on the select variant === { value: 10, name: undefined }
       *
       * See GitHub issue: https://github.com/mui-org/material-ui/issues/16470
       */
      if (e.target.value !== cleanedValue) {
        const clonedEvent = {
          ...e,
          target: e.target.cloneNode(),
        } as React.ChangeEvent<HTMLInputElement>;

        clonedEvent.target.value = `${cleanedValue}`;
        onChange(clonedEvent);
      } else {
        onChange(e);
      }
    }
  };

  let errorScrollClassName = '';

  if (errorText) {
    errorScrollClassName = errorGroup
      ? `error-for-scroll-${errorGroup}`
      : `error-for-scroll`;
  }

  const validInputId =
    inputId || (label ? convertToKebabCase(`${label}`) : undefined);

  return (
    <div
      className={classNames({
        [classes.helpWrapper]: Boolean(tooltipText),
        [errorScrollClassName]: !!errorText,
      })}
    >
      <InputLabel
        data-qa-textfield-label={label}
        className={classNames({
          [classes.wrapper]: noMarginTop ? false : true,
          [classes.noTransform]: true,
          'visually-hidden': hideLabel,
        })}
        htmlFor={validInputId}
      >
        {label}
        {required ? (
          <span className={classes.label}> (required)</span>
        ) : optional ? (
          <span className={classes.label}> (optional)</span>
        ) : null}
      </InputLabel>

      {helperText && helperTextPosition === 'top' && (
        <FormHelperText
          data-qa-textfield-helper-text
          className={classes.helperTextTop}
        >
          {helperText}
        </FormHelperText>
      )}
      <div
        className={classNames({
          [classes.helpWrapperContainer]: Boolean(tooltipText),
        })}
      >
        <TextField
          {...textFieldProps}
          {...dataAttrs}
          error={!!error || !!errorText}
          /**
           * Set _helperText_ and _label_ to no value because we want to
           * have the ability to put the helper text under the label at the top.
           */
          label={''}
          helperText={''}
          fullWidth
          /*
           * Let us explicitly pass an empty string to the input
           * See UserDefinedFieldsPanel.tsx for a verbose explanation why.
           */
          value={_value}
          onChange={handleChange}
          InputLabelProps={{
            ...InputLabelProps,
            required: false,
            shrink: true,
          }}
          inputProps={{
            'data-testid': 'textfield-input',
            id: validInputId,
            ...inputProps,
          }}
          InputProps={{
            disableUnderline: true,
            endAdornment: loading && (
              <InputAdornment position="end">
                <CircleProgress mini />
              </InputAdornment>
            ),
            className: classNames(
              'input',
              {
                [classes.expand]: expand,
              },
              className
            ),
            ...InputProps,
          }}
          SelectProps={{
            disableUnderline: true,
            IconComponent: KeyboardArrowDown,
            MenuProps: {
              getContentAnchorEl: undefined,
              anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
              transformOrigin: { vertical: 'top', horizontal: 'left' },
              MenuListProps: { className: 'selectMenuList' },
              PaperProps: { className: 'selectMenuDropdown' },
            },
            ...SelectProps,
          }}
          className={classNames(
            {
              [classes.root]: true,
              [classes.helpWrapperTextField]: Boolean(tooltipText),
            },
            className
          )}
          type={type}
        >
          {children}
        </TextField>
        {tooltipText && (
          <HelpIcon
            className={classes.helpIcon}
            classes={{ popper: tooltipClasses }}
            text={tooltipText}
            tooltipPosition={tooltipPosition}
            onMouseEnter={tooltipOnMouseEnter}
          />
        )}
      </div>
      {errorText && (
        <FormHelperText
          className={classNames({
            [classes.errorText]: true,
            [classes.editable]: editable,
            [classes.absolute]: editable || hasAbsoluteError,
          })}
          data-qa-textfield-error-text={label}
          role="alert"
        >
          {errorText}
        </FormHelperText>
      )}
      {helperText &&
        (helperTextPosition === 'bottom' || !helperTextPosition) && (
          <FormHelperText data-qa-textfield-helper-text>
            {helperText}
          </FormHelperText>
        )}
    </div>
  );
};

export default compose<CombinedProps, Props>(React.memo)(
  LinodeTextField
) as React.ComponentType<Props>;
