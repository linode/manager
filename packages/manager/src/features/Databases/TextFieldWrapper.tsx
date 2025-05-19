import { convertToKebabCase } from '@linode/ui';
import { Box, FormHelperText, InputLabel, TooltipIcon } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import { TextField } from 'akamai-cds-react-components';
import React, { useId, useRef } from 'react';

interface BaseProps {
  disabled?: boolean;
  /**
   * When defined, makes the input show an error state with the defined text
   */
  errorText?: string;
  label: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value?: Value;
}

type Value = string | undefined;

interface InputToolTipProps {
  tooltipText?: JSX.Element | string;
}

type TextFieldWrapperProps = BaseProps & InputToolTipProps;

export const TextFieldWrapper = (props: TextFieldWrapperProps) => {
  const { disabled, errorText, label, onChange, tooltipText, value } = props;

  const [_value, setValue] = React.useState<Value>(value ?? '');
  const theme = useTheme();
  const inputRef = useRef<HTMLInputElement | null>(null); // Ref for the input field

  const isControlled = value !== undefined;

  const useFieldIds = ({
    hasError = false,
    label,
  }: {
    hasError?: boolean;
    label: string;
  }) => {
    const fallbackId = useId();
    const validInputId = label ? convertToKebabCase(label) : fallbackId;
    const helperTextId = `${validInputId}-helper-text`;
    const errorTextId = `${validInputId}-error-text`;
    const errorScrollClassName = hasError ? `error-for-scroll` : '';

    return {
      errorScrollClassName,
      errorTextId,
      helperTextId,
      validInputId,
    };
  };

  const { errorScrollClassName, errorTextId, validInputId } = useFieldIds({
    hasError: Boolean(errorText),
    label,
  });

  React.useEffect(() => {
    if (isControlled) {
      setValue(value);
    }
  }, [value, isControlled]);

  // Simulate htmlFor for the label as it doesn't work with shadow DOM
  const handleLabelClick = () => {
    if (inputRef.current) {
      const shadowRoot = inputRef.current.shadowRoot;
      if (shadowRoot) {
        const inputElement = shadowRoot.querySelector('input');
        if (inputElement) {
          (inputElement as HTMLElement).focus();
        }
      }
    }
  };

  return (
    <Box
      className={`${errorText ? errorScrollClassName : ''}`}
      sx={{
        ...(Boolean(tooltipText) && {
          alignItems: 'flex-end',
          display: 'flex',
          flexWrap: 'wrap',
        }),
      }}
    >
      <Box
        alignItems={'center'}
        data-testid="inputLabelWrapper"
        display="flex"
        sx={{
          marginBottom: theme.spacingFunction(8),
          marginTop: theme.spacingFunction(16),
        }}
      >
        <InputLabel
          data-qa-textfield-label={label}
          htmlFor={validInputId}
          onClick={handleLabelClick}
          sx={{
            marginBottom: 0,
            transform: 'none',
          }}
        >
          {label}
        </InputLabel>
      </Box>
      <Box
        sx={{
          ...(Boolean(tooltipText) && {
            display: 'flex',
            width: '100%',
          }),
        }}
      >
        <Box
          sx={{
            width: '416px',
            minWidth: '120px',
          }}
        >
          <TextField
            aria-errormessage={errorText ? errorTextId : undefined}
            aria-invalid={!!errorText}
            className={errorText ? 'error' : ''}
            data-testid="textfield-input"
            disabled={disabled}
            id={validInputId}
            onChange={(e) =>
              onChange?.(e as unknown as React.ChangeEvent<HTMLInputElement>)
            }
            ref={inputRef as React.RefObject<never>}
            value={_value}
          />
        </Box>
        {tooltipText && (
          <TooltipIcon
            status="help"
            sxTooltipIcon={{
              height: '34px',
              margin: '0px 0px 0px 4px',
              padding: '17px',
              width: '34px',
            }}
            text={tooltipText}
          />
        )}
      </Box>
      {errorText && (
        <FormHelperText
          data-qa-textfield-error-text={label}
          role="alert"
          sx={{
            alignItems: 'center',
            color: theme.palette.error.dark,
            display: 'flex',
            left: 5,
            top: 42,
            width: '100%',
          }}
        >
          {errorText}
        </FormHelperText>
      )}
    </Box>
  );
};
