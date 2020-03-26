import * as classnames from 'classnames';
import * as React from 'react';
import Minus from 'src/assets/icons/minusSign.svg';
import Plus from 'src/assets/icons/plusSign.svg';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import TextField from 'src/components/TextField';

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    width: 40,
    height: 40,
    minWidth: 40,
    padding: 0
  },
  textField: {
    margin: '0 5px',
    height: 40,
    minHeight: 40,
    width: 60,
    minWidth: 50,
    flexDirection: 'row'
  },
  input: {
    textAlign: 'right',
    '-moz-appearance': 'textfield',
    '&::-webkit-inner-spin-button': {
      '-webkit-appearance': 'none',
      margin: 0
    },
    '&::-webkit-outer-spin-button': {
      '-webkit-appearance': 'none',
      margin: 0
    }
  },
  plusIcon: {
    width: 17
  },
  minusIcon: {
    width: 14
  },
  inputGroup: {
    display: 'flex',
    position: 'relative'
  },
  small: {
    '& $button': {
      width: 30,
      height: 30,
      minWidth: 30
    },
    '& $textField': {
      width: 50,
      minWidth: 40,
      height: 30,
      minHeight: 30
    },
    '& $plusIcon': {
      width: 14
    }
  }
}));

interface Props {
  inputLabel?: string;
  small?: boolean;
  value: number;
  setValue: (value: number) => void;
  disabled?: boolean;
}

type FinalProps = Props;

export const EnhancedNumberInput: React.FC<FinalProps> = props => {
  const { inputLabel, small, value, setValue, disabled } = props;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(+e.target.value);
  };

  const incrementValue = () => setValue(value + 1);

  const decrementValue = () => {
    if (value > 0) {
      setValue(value - 1);
    }
  };

  const classes = useStyles();
  return (
    <React.Fragment>
      <div
        className={classnames({
          [classes.small]: small,
          [classes.inputGroup]: true
        })}
      >
        <Button
          buttonType="primary"
          className={classes.button}
          compact
          aria-label="Subtract 1"
          name="Subtract 1"
          onClick={decrementValue}
          disabled={disabled || value === 0 ? true : false}
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
          small={small}
          value={value}
          onChange={onChange}
          inputProps={{
            className: classnames({
              [classes.input]: true
            }),
            min: 0
          }}
          autoFocus={true}
          disabled={disabled}
          data-testid={'quantity-input'}
        />
        <Button
          buttonType="primary"
          compact
          className={classes.button}
          aria-label="Add 1"
          name="Add 1"
          onClick={incrementValue}
          disabled={disabled}
          data-testid={'increment-button'}
        >
          <Plus className={classes.plusIcon} />
        </Button>
      </div>
    </React.Fragment>
  );
};

export default EnhancedNumberInput;
