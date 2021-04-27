import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import * as classNames from 'classnames';
import { clamp } from 'ramda';
import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import FormHelperText from 'src/components/core/FormHelperText';
import InputAdornment from 'src/components/core/InputAdornment';
import InputLabel from 'src/components/core/InputLabel';
import { makeStyles, Theme } from 'src/components/core/styles';
import TextField, { TextFieldProps } from 'src/components/core/TextField';
import HelpIcon from 'src/components/HelpIcon';
import { convertToKebabCase } from 'src/utilities/convertToKebobCase';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    marginTop: theme.spacing(2),
  },
  noTransform: {
    transform: 'none',
  },
  helpWrapperContainer: {
    display: 'flex',
    width: '100%',
  },
  helpWrapper: {
    display: 'flex',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  },
  helpWrapperTextField: {
    width: 415,
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
  helpIcon: {
    padding: '0px 0px 0px 8px',
    color: theme.cmrTextColors.tableHeader,
  },
  expand: {
    maxWidth: '100%',
  },
  small: {
    minHeight: 32,
    marginTop: 0,
    '& input': {
      minHeight: 32,
      padding: theme.spacing(1),
    },
  },
  selectSmall: {
    padding: '8px 32px 0 8px',
    minHeight: 32,
    minWidth: 132,
    '& svg': {
      marginTop: 0,
      width: 24,
      height: 24,
    },
  },
  tiny: {
    width: '3.6em',
  },
  errorText: {
    display: 'flex',
    alignItems: 'center',
    color: theme.color.red,
    height: 34,
    top: -2,
    left: 285,
    width: 'max-content',
  },
  // Adjusts position of errorText when textfield is in breadcrumb
  errorTextBreadcrumb: {
    [theme.breakpoints.down('md')]: {
      maxWidth: 300,
    },
    [theme.breakpoints.down('sm')]: {
      left: 248,
      maxWidth: 200,
    },
    [theme.breakpoints.down('xs')]: {
      top: 26,
      left: 6,
      maxWidth: 300,
    },
  },
  errorTextLong: {
    [theme.breakpoints.down('xs')]: {
      top: 36,
    },
  },
  absolute: {
    position: 'absolute',
  },
  editable: {
    wordBreak: 'keep-all',
  },
  helperTextTop: {
    marginBottom: theme.spacing(),
    marginTop: theme.spacing(),
  },
  noMarginTop: {
    marginTop: 0,
  },
}));

interface BaseProps {
  errorText?: string;
  errorGroup?: string;
  affirmative?: boolean;
  helperTextPosition?: 'top' | 'bottom';
  tooltipText?: string;
  className?: any;
  expand?: boolean;
  small?: boolean;
  editable?: boolean;
  // Currently only used for LKE node pool inputs
  tiny?: boolean;
  /**
   * Number amounts allowed in textfield
   * "type" prop must also be set to "number"
   */
  min?: number;
  max?: number;
  dataAttrs?: Record<string, any>;
  noMarginTop?: boolean;
  loading?: boolean;
  hideLabel?: boolean;
  hasAbsoluteError?: boolean;
  inputId?: string;
  inBreadcrumb?: boolean;
}

interface TextFieldPropsOverrides extends TextFieldProps {
  // We override this prop to make it required
  label: string;
}

export type Props = BaseProps & TextFieldProps & TextFieldPropsOverrides;

type CombinedProps = Props;

export const LinodeTextField: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const {
    value,
    errorText,
    errorGroup,
    affirmative,
    helperText,
    helperTextPosition,
    tooltipText,
    className,
    expand,
    small,
    editable,
    tiny,
    onChange,
    error,
    label,
    type,
    min,
    max,
    dataAttrs,
    noMarginTop,
    loading,
    hideLabel,
    hasAbsoluteError,
    inputId,
    inBreadcrumb,
    inputProps,
    InputProps,
    InputLabelProps,
    SelectProps,
    ...textFieldProps
  } = props;

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const numberTypes = ['tel', 'number'];
      /** because !!0 is falsy :( */
      const minAndMaxExist = typeof min === 'number' && typeof max === 'number';
      /**
       * If we've provided a mix and max value, make sure the user
       * input doesn't go outside of those bounds ONLY if the input
       * type matches a number type
       */
      const cleanedValue =
        minAndMaxExist &&
        numberTypes.some((eachType) => eachType === type) &&
        e.target.value !== ''
          ? clamp(min, max, +e.target.value)
          : e.target.value;

      /**
       * Invoke the onChange prop if one is provided with the cleaned value.
       */
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
         *
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
    },
    [max, min, onChange, type]
  );

  let errorScrollClassName = '';

  if (errorText) {
    errorScrollClassName = errorGroup
      ? `error-for-scroll-${errorGroup}`
      : `error-for-scroll`;
  }

  const maybeRequiredLabel = !!props.required ? `${label} (required)` : label;
  const validInputId =
    inputId || (props.label ? convertToKebabCase(`${props.label}`) : undefined);

  return (
    <div
      className={classNames({
        [classes.helpWrapper]: Boolean(tooltipText),
        [errorScrollClassName]: !!errorText,
      })}
    >
      {maybeRequiredLabel && (
        <InputLabel
          data-qa-textfield-label={label}
          className={classNames({
            [classes.noTransform]: true,
            [classes.wrapper]: noMarginTop ? false : true,
            'visually-hidden': hideLabel,
          })}
          htmlFor={validInputId}
        >
          {maybeRequiredLabel}
        </InputLabel>
      )}
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
           * set _helperText_ and _label_ to no value because we want to
           * have the ability to put the helper text under the label at the top
           */
          label={''}
          helperText={''}
          fullWidth
          /*
            let us explicitly pass an empty string to the input

            see UserDefinedFieldsPanel.tsx for a verbose explanation why.
          */
          value={value}
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
                [classes.small]: small,
                [classes.tiny]: tiny,
                affirmative: !!affirmative,
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
            inputProps: {
              className: classNames({
                [classes.selectSmall]: small,
              }),
            },
            ...SelectProps,
          }}
          className={classNames(
            {
              [classes.noMarginTop]: true,
              [classes.helpWrapperTextField]: Boolean(tooltipText),
              [classes.small]: small,
            },
            className
          )}
        >
          {props.children}
        </TextField>
        {tooltipText && (
          <HelpIcon className={classes.helpIcon} text={tooltipText} />
        )}
      </div>
      {errorText && (
        <FormHelperText
          className={classNames({
            [classes.errorText]: true,
            [classes.errorTextBreadcrumb]: inBreadcrumb,
            [classes.errorTextLong]: inBreadcrumb && errorText.length > 45,
            [classes.editable]: editable,
            [classes.absolute]: editable || hasAbsoluteError,
          })}
          data-qa-textfield-error-text={props.label}
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

export default React.memo(LinodeTextField);
