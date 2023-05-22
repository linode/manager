import * as React from 'react';
import Minus from 'src/assets/icons/LKEminusSign.svg';
import Plus from 'src/assets/icons/LKEplusSign.svg';
import Button from 'src/components/Button';
import { styled } from '@mui/material/styles';
import TextField from 'src/components/TextField';

// const useStyles = makeStyles<
//   void,
//   'button' | 'input' | 'textField' | 'plusIcon' | 'minusIcon'
// >()((_theme, _params, classes) => ({
//   root: {
//     [`& .${classes.button}`]: {
//       width: 35,
//       height: 34,
//       minWidth: 30,
//       border: 'none',
//       '&:hover': {
//         backgroundColor: 'rgba(224, 224, 224, 0.69) !important',
//       },
//     },
//     [`& .${classes.input}`]: {
//       padding: '0 8px',
//     },
//     [`& .${classes.textField}`]: {
//       width: 53,
//       minWidth: 40,
//       height: 34,
//       minHeight: 30,
//     },
//     [`& .${classes.plusIcon}`]: {
//       width: 14,
//     },
//     [`& .${classes.minusIcon}`]: {
//       width: 12,
//     },
//   },
//   inputGroup: {
//     display: 'flex',
//     position: 'relative',
//     '& button': {
//       borderRadius: 0,
//       minHeight: 'fit-content',
//     },
//   },
// }));

const inputOverrides = {
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

interface EnhancedNumberInputProps {
  inputLabel?: string;
  value: number;
  setValue: (value: number) => void;
  disabled?: boolean;
  max?: number;
  min?: number;
}

export const EnhancedNumberInput = (props: EnhancedNumberInputProps) => {
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
    <EnhancedNumberInputRoot>
      <Button
        buttonType="outlined"
        compactX
        disabled={disabled || value === min}
        onClick={decrementValue}
        name="Subtract 1"
        aria-label="Subtract 1"
        data-testid={'decrement-button'}
        sx={{
          height: 40,
          minWidth: 40,
          width: 40,
        }}
      >
        <MinusIcon />
      </Button>
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
          flexDirection: 'row',
          height: 40,
          margin: '0 5px',
          minHeight: 40,
          minWidth: 50,
          width: 60,
          '.MuiInputBase-input': inputOverrides,
        }}
      />
      <Button
        buttonType="outlined"
        compactX
        disabled={disabled || value === max}
        onClick={incrementValue}
        name="Add 1"
        aria-label="Add 1"
        data-testid={'increment-button'}
        sx={{
          height: 40,
          minWidth: 40,
          width: 40,
        }}
      >
        <PlusIcon />
      </Button>
    </EnhancedNumberInputRoot>
  );
};

const EnhancedNumberInputRoot = styled('div', {
  label: 'EnhancedNumberInput',
})({
  // Add className={`${classes.root} ${classes.inputGroup}`}
});

const MinusIcon = styled(Minus)({
  width: 14,
});

const PlusIcon = styled(Plus)({
  width: 17,
});

export default React.memo(EnhancedNumberInput);
