import classNames from 'classnames';
import * as React from 'react';
import Minus from 'src/assets/icons/LKEminusSign.svg';
import Plus from 'src/assets/icons/LKEplusSign.svg';
import Button from 'src/components/Button';
import { makeStyles } from 'src/components/core/styles';
import TextField from 'src/components/TextField';

const useStyles = makeStyles(() => ({
  root: {
    '& $button': {
      width: 35,
      height: 34,
      minWidth: 30,
      border: 'none',
      '&:hover': {
        backgroundColor: 'rgba(224, 224, 224, 0.69) !important',
      },
    },
    '& $input': {
      padding: '0 8px',
    },
    '& $textField': {
      width: 53,
      minWidth: 40,
      height: 34,
      minHeight: 30,
    },
    '& $plusIcon': {
      width: 14,
    },
    '& $minusIcon': {
      width: 12,
    },
  },
  button: {
    width: 40,
    height: 40,
    minWidth: 40,
  },
  textField: {
    margin: '0 5px',
    height: 40,
    minHeight: 40,
    width: 60,
    minWidth: 50,
    flexDirection: 'row',
  },
  input: {
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
  },
  plusIcon: {
    width: 17,
  },
  minusIcon: {
    width: 14,
  },
  inputGroup: {
    display: 'flex',
    position: 'relative',
    '& button': {
      borderRadius: 0,
      minHeight: 'fit-content',
    },
  },
}));

interface Props {
  inputLabel?: string;
  value: number;
  setValue: (value: number) => void;
  disabled?: boolean;
  max?: number;
  min?: number;
}

export const EnhancedNumberInput: React.FC<Props> = (props) => {
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
  const classes = useStyles();
  return (
    <div className={`${classes.root} ${classes.inputGroup}`}>
      <Button
        buttonType="outlined"
        className={classes.button}
        compactX
        disabled={disabled || value === min}
        onClick={decrementValue}
        name="Subtract 1"
        aria-label="Subtract 1"
        data-testid={'decrement-button'}
      >
        <Minus className={classes.minusIcon} />
      </Button>
      <TextField
        className={classes.textField}
        type="number"
        label={inputLabel ? inputLabel : 'Edit Quantity'}
        aria-live="polite"
        name="Quantity"
        hideLabel
        value={value}
        onChange={onChange}
        inputProps={{
          className: classNames({
            [classes.input]: true,
          }),
        }}
        min={min}
        max={max}
        disabled={disabled}
        data-testid={'quantity-input'}
      />
      <Button
        buttonType="outlined"
        className={classes.button}
        compactX
        disabled={disabled || value === max}
        onClick={incrementValue}
        name="Add 1"
        aria-label="Add 1"
        data-testid={'increment-button'}
      >
        <Plus className={classes.plusIcon} />
      </Button>
    </div>
  );
};

export default React.memo(EnhancedNumberInput);
