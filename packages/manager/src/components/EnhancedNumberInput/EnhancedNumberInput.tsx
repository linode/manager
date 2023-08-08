import { Box } from 'src/components/Box';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import Minus from 'src/assets/icons/LKEminusSign.svg';
import Plus from 'src/assets/icons/LKEplusSign.svg';
import { Button } from 'src/components/Button/Button';
import { TextField } from 'src/components/TextField';

const sxTextFieldBase = {
  '&::-webkit-inner-spin-button': {
    '-webkit-appearance': 'none',
    margin: 0,
  },
  '&::-webkit-outer-spin-button': {
    '-webkit-appearance': 'none',
    margin: 0,
  },
  '-moz-appearance': 'textfield',
  padding: '0 8px',
  textAlign: 'right',
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
  /** Disables the input and the +/- buttons */
  disabled?: boolean;
  /** The label of the input. This prop does not cause any visual UI changes */
  inputLabel?: string;
  /** The max number allowed in the input. The +/- buttons will disable accordingly */
  max?: number;
  /** The min number allowed in the input. The +/- buttons will disable accordingly */
  min?: number;
  /** The function to update the numeric value */
  setValue: (value: number) => void;
  /** Allows you to control the numeric value of the input from outside the component */
  value: number;
}

export const EnhancedNumberInput = React.memo(
  (props: EnhancedNumberInputProps) => {
    const { disabled, inputLabel, setValue } = props;

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
          aria-label="Subtract 1"
          buttonType="outlined"
          data-testid={'decrement-button'}
          disableFocusRipple
          disabled={disabled || value === min}
          name="Subtract 1"
          onClick={decrementValue}
        >
          <MinusIcon />
        </StyledButton>
        <TextField
          sx={{
            ...sxTextField,
            '.MuiInputBase-input': sxTextFieldBase,
            '.MuiInputBase-root': sxTextField,
          }}
          aria-live="polite"
          data-testid={'quantity-input'}
          disabled={disabled}
          hideLabel
          label={inputLabel ? inputLabel : 'Edit Quantity'}
          max={max}
          min={min}
          name="Quantity"
          onChange={onChange}
          type="number"
          value={value}
        />
        <StyledButton
          aria-label="Add 1"
          buttonType="outlined"
          data-testid={'increment-button'}
          disableFocusRipple
          disabled={disabled || value === max}
          name="Add 1"
          onClick={incrementValue}
        >
          <PlusIcon />
        </StyledButton>
      </Box>
    );
  }
);

const StyledButton = styled(Button)(({ theme }) => ({
  '&.MuiButtonBase-root.Mui-disabled': {
    '& svg g': {
      stroke: theme.color.disabledText,
    },

    border: 'none',
  },
  '&:hover': {
    backgroundColor: 'rgba(224, 224, 224, 0.69)',
    border: 'none',
  },
  border: 'none',
  borderRadius: 0,
  height: 34,
  minHeight: 'fit-content',
  minWidth: 30,
  width: 35,
}));

const MinusIcon = styled(Minus)({
  width: 12,
});

const PlusIcon = styled(Plus)({
  width: 14,
});
