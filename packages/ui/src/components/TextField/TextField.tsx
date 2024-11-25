import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import { useTheme } from '@mui/material/styles';
import { default as _TextField } from '@mui/material/TextField';
import React from 'react';

import { clamp, convertToKebabCase } from '../../utilities';
import { Box } from '../Box';
import { CircleProgress } from '../CircleProgress';
import { FormHelperText } from '../FormHelperText';
import { InputAdornment } from '../InputAdornment';
import { InputLabel } from '../InputLabel';
import { TooltipIcon } from '../TooltipIcon';

import type { BoxProps } from '../Box';
import type { TooltipProps } from '../Tooltip';
import type { StandardTextFieldProps } from '@mui/material/TextField';

interface BaseProps {
  /**
   * className to apply to the underlying TextField component
   */
  className?: string;
  /**
   * Props applied to the root element
   */
  containerProps?: BoxProps;
  /**
   * Data attributes are applied to the underlying TextField component for testing purposes
   */
  dataAttrs?: Record<string, any>;
  /**
   * Applies editable styles
   * @default false
   */
  editable?: boolean;
  /**
   * Adds error grouping to TextField
   */
  errorGroup?: string;
  /**
   * When defined, makes the input show an error state with the defined text
   */
  errorText?: string;
  /**
   * Makes the TextField use 100% of the available width
   * @default false
   */
  expand?: boolean;
  /**
   * Makes the error text have the absolute positioning
   * @default false
   */
  hasAbsoluteError?: boolean;
  /**
   * Placement of the `helperText`
   * @default bottom
   */
  helperTextPosition?: 'bottom' | 'top';
  /**
   * Hides the `label`
   * @default false
   */
  hideLabel?: boolean;
  /**
   * Allows you to manually set an htmlFor input id. One will automatically be generated by the `label` if this is unset
   */
  inputId?: string;
  /**
   * Displays a loading spinner at the end of the Text Field
   * @default false
   */
  loading?: boolean;
  /**
   * The maximum number allowed in TextField. The "type" prop must also be set to `number`
   */
  max?: number;
  /**
   * The minimum number allowed in TextField. The "type" prop must also be set to `number`
   */
  min?: number;
  /**
   * Removes the default top margin (16px)
   * @default false
   */
  noMarginTop?: boolean;
  /**
   * Adds `(optional)` to the Label
   * @default false
   */
  optional?: boolean;
  /**
   * Adds `(required)` to the Label
   */
  required?: boolean;
  /**
   * The leading and trailing spacing should be trimmed from the textfield on blur; intended to be used for username, emails, and SSH key input only
   */
  trimmed?: boolean;
  value?: Value;
}

type Value = null | number | string | undefined;

interface LabelToolTipProps {
  labelTooltipText?: JSX.Element | string;
}

interface InputToolTipProps {
  tooltipClasses?: string;
  tooltipOnMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  tooltipPosition?: TooltipProps['placement'];
  tooltipText?: JSX.Element | string;
  tooltipWidth?: number;
}

interface TextFieldPropsOverrides extends StandardTextFieldProps {
  // We override this prop to make it required
  label: string;
}

export type TextFieldProps = BaseProps &
  TextFieldPropsOverrides &
  LabelToolTipProps &
  InputToolTipProps;

export const TextField = (props: TextFieldProps) => {
  const {
    InputLabelProps,
    InputProps,
    SelectProps,
    children,
    className,
    containerProps,
    dataAttrs,
    editable,
    error,
    errorGroup,
    errorText,
    expand,
    hasAbsoluteError,
    helperText,
    helperTextPosition = 'bottom',
    hideLabel,
    inputId,
    inputProps,
    label,
    labelTooltipText,
    loading,
    max,
    min,
    noMarginTop,
    onBlur,
    onChange,
    optional,
    required,
    tooltipClasses,
    tooltipOnMouseEnter,
    tooltipPosition,
    tooltipText,
    tooltipWidth,
    trimmed,
    type,
    value,
    ...textFieldProps
  } = props;

  const [_value, setValue] = React.useState<Value>(value);
  const theme = useTheme();

  React.useEffect(() => {
    setValue(value);
  }, [value]);

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (trimmed) {
      const trimmedValue = e.target.value.trim();
      e.target.value = trimmedValue;
      setValue(trimmedValue);
    }
    if (onBlur) {
      onBlur(e);
    }
  };

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
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
    },
    [min, max, type, onChange]
  );

  let errorScrollClassName = '';

  if (errorText) {
    errorScrollClassName = errorGroup
      ? `error-for-scroll-${errorGroup}`
      : `error-for-scroll`;
  }

  const validInputId =
    inputId || (label ? convertToKebabCase(`${label}`) : undefined);

  const labelSuffixText = required
    ? '(required)'
    : optional
    ? '(optional)'
    : null;

  return (
    <Box
      {...containerProps}
      className={`${errorText ? errorScrollClassName : ''} ${
        containerProps?.className || ''
      }`}
      sx={{
        ...(Boolean(tooltipText) && {
          alignItems: 'flex-end',
          display: 'flex',
          flexWrap: 'wrap',
        }),
        ...containerProps?.sx,
      }}
    >
      <Box
        sx={{
          marginBottom: theme.spacing(1),
          ...(!noMarginTop && { marginTop: theme.spacing(2) }),
        }}
        alignItems={'center'}
        className={hideLabel ? 'visually-hidden' : ''}
        data-testid="inputLabelWrapper"
        display="flex"
      >
        <InputLabel
          sx={{
            marginBottom: 0,
            transform: 'none',
          }}
          data-qa-textfield-label={label}
          htmlFor={validInputId}
        >
          {label}
          {labelSuffixText && (
            <Box component="span" sx={{ fontFamily: theme.font.normal }}>
              {' '}
              {labelSuffixText}
            </Box>
          )}
        </InputLabel>
        {labelTooltipText && (
          <TooltipIcon
            sxTooltipIcon={{
              marginLeft: `${theme.spacing(0.5)}`,
              padding: `${theme.spacing(0.5)}`,
            }}
            status="help"
            text={labelTooltipText}
          />
        )}
      </Box>

      {helperText && helperTextPosition === 'top' && (
        <FormHelperText
          sx={{
            marginBottom: theme.spacing(),
            marginTop: theme.spacing(),
          }}
          data-qa-textfield-helper-text
        >
          {helperText}
        </FormHelperText>
      )}
      <Box
        sx={{
          ...(Boolean(tooltipText) && {
            display: 'flex',
            width: '100%',
          }),
        }}
      >
        <_TextField
          {...textFieldProps}
          {...dataAttrs}
          InputLabelProps={{
            ...InputLabelProps,
            required: false,
            shrink: true,
          }}
          InputProps={{
            className,
            disableUnderline: true,
            endAdornment: loading && (
              <InputAdornment position="end">
                <CircleProgress size="sm" />
              </InputAdornment>
            ),
            sx: {
              ...(expand && {
                maxWidth: '100%',
              }),
            },
            ...InputProps,
          }}
          SelectProps={{
            IconComponent: KeyboardArrowDown,
            MenuProps: {
              MenuListProps: { className: 'selectMenuList' },
              PaperProps: { className: 'selectMenuDropdown' },
              anchorOrigin: { horizontal: 'left', vertical: 'bottom' },
              transformOrigin: { horizontal: 'left', vertical: 'top' },
            },
            disableUnderline: true,
            ...SelectProps,
          }}
          inputProps={{
            'data-testid': 'textfield-input',
            id: validInputId,
            ...inputProps,
          }}
          sx={{
            marginTop: 0,
            ...(Boolean(tooltipText) && {
              width: '415px',
            }),
            ...props.sx,
          }}
          className={className}
          error={!!error || !!errorText}
          fullWidth
          helperText={''}
          /**
           * Set _helperText_ and _label_ to no value because we want to
           * have the ability to put the helper text under the label at the top.
           */
          label={''}
          onBlur={handleBlur}
          onChange={handleChange}
          type={type}
          /*
           * Let us explicitly pass an empty string to the input
           * See UserDefinedFieldsPanel.tsx for a verbose explanation why.
           */
          value={_value}
          variant="standard"
        >
          {children}
        </_TextField>
        {tooltipText && (
          <TooltipIcon
            sxTooltipIcon={{
              height: '34px',
              margin: '0px 0px 0px 4px',
              padding: '17px',
              width: '34px',
            }}
            classes={{ popper: tooltipClasses }}
            onMouseEnter={tooltipOnMouseEnter}
            status="help"
            text={tooltipText}
            tooltipPosition={tooltipPosition}
            width={tooltipWidth}
          />
        )}
      </Box>
      {errorText && (
        <FormHelperText
          sx={{
            ...((editable || hasAbsoluteError) && {
              position: 'absolute',
            }),
            ...(editable && {
              paddingLeft: 1,
              wordBreak: 'keep-all',
            }),
            alignItems: 'center',
            color: theme.palette.error.dark,
            display: 'flex',
            left: 5,
            top: 42,
            width: '100%',
          }}
          data-qa-textfield-error-text={label}
          role="alert"
        >
          {errorText}
        </FormHelperText>
      )}
      {helperText && helperTextPosition === 'bottom' && (
        <FormHelperText data-qa-textfield-helper-text>
          {helperText}
        </FormHelperText>
      )}
    </Box>
  );
};
