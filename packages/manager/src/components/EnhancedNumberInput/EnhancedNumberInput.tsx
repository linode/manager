import * as React from 'react';
import Minus from 'src/assets/icons/LKEminusSign.svg';
import Plus from 'src/assets/icons/LKEplusSign.svg';
import { Button } from 'src/components/Button/Button';
import { styled } from '@mui/material/styles';
import { TextField } from 'src/components/TextField';
import Box from '@mui/material/Box';

const sxTextFieldBase = {
  padding: '0 8px',
  textAlign: 'right',
  '-moz-appearance': 'textfield',
  '&::-webkit-inner-spin-button': {
    '-webkit-appearance': 'none',
    margin: 0,
  },
  '&::-webkit-outer-spin-button': {
    '-webkit-appearance': 'none',
    margin: 0,
  },
};

const sxTextField = {
  flexDirection: 'row',
  height: 34,
  margin: '0 5px',
  minHeight: 30,
  minWidth: 40,
  width: 53,
};

interface EnhancedNumberInputProps {
  /** The label of the input. This prop does not cause any visual UI changes */
  inputLabel?: string;
  /** Allows you to control the numeric value of the input from outside the component */
  value: number;
  /** The function to update the numeric value */
  setValue: (value: number) => void;
  /** Disables the input and the +/- buttons */
  disabled?: boolean;
  /** The max number allowed in the input. The +/- buttons will disable accordingly */
  max?: number;
  /** The min number allowed in the input. The +/- buttons will disable accordingly */
  min?: number;
}

export const EnhancedNumberInput = React.memo(
  (props: EnhancedNumberInputProps) => {
    const { inputLabel, setValue, disabled } = props;

    const max = props.max ?? 100;
    const min = props.min ?? 0;

    let value = props.value;
    if (value > max) {
      value = max;
    } else if (value < min) {
      value = min;
    }

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const parsedValue = +e.target.value;
      if (parsedValue >= min && parsedValue <= max) {
        setValue(+e.target.value);
      }
    };

    const incrementValue = () => {
      if (value < max) {
        setValue(value + 1);
      }
    };

    const decrementValue = () => {
      if (value > min) {
        setValue(value - 1);
      }
    };

    // TODO add error prop for error handling

    return (
      <Box
        sx={{
          display: 'flex',
          position: 'relative',
        }}
      >
        <StyledButton
          buttonType="outlined"
          disabled={disabled || value === min}
          onClick={decrementValue}
          name="Subtract 1"
          aria-label="Subtract 1"
          data-testid={'decrement-button'}
          disableFocusRipple
        >
          <MinusIcon />
        </StyledButton>
        <TextField
          type="number"
          label={inputLabel ? inputLabel : 'Edit Quantity'}
          aria-live="polite"
          name="Quantity"
          hideLabel
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          disabled={disabled}
          data-testid={'quantity-input'}
          sx={{
            ...sxTextField,
            '.MuiInputBase-root': sxTextField,
            '.MuiInputBase-input': sxTextFieldBase,
          }}
        />
        <StyledButton
          buttonType="outlined"
          disabled={disabled || value === max}
          onClick={incrementValue}
          name="Add 1"
          aria-label="Add 1"
          data-testid={'increment-button'}
          disableFocusRipple
        >
          <PlusIcon />
        </StyledButton>
      </Box>
    );
  }
);

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 0,
  height: 34,
  minHeight: 'fit-content',
  minWidth: 30,
  width: 35,
  border: 'none',
  '&:hover': {
    backgroundColor: 'rgba(224, 224, 224, 0.69)',
    border: 'none',
  },
  '&.MuiButtonBase-root.Mui-disabled': {
    border: 'none',

    '& svg g': {
      stroke: theme.color.disabledText,
    },
  },
}));

const MinusIcon = styled(Minus)({
  width: 12,
});

const PlusIcon = styled(Plus)({
  width: 14,
});
