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
    fontSize: '2rem',
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
    '&::-webkit-inner-spin-button': {
      '-webkit-appearance': 'none',
      margin: 0
    },
    '&::-webkit-outer-spin-button': {
      '-webkit-appearance': 'none',
      margin: 0
    },
    // Firefox
    '& input[type=number]': {
      '-moz-appearance': 'textfield'
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
    },
    '& $minusIcon': {
      width: 14
    }
  }
}));

interface Props {
  inputLabel?: string;
  small?: boolean;
  inputValue: number;
  disabled?: boolean;
  minusDisabled?: boolean;
}

type FinalProps = Props;

export const EnhancedNumberInput: React.FC<FinalProps> = props => {
  const [inputValue, setInputValue] = React.useState(0);
  const [isDisabled, setIsDisabled] = React.useState(Boolean(props.disabled));
  const [minusIsDisabled, setMinusIsDisabled] = React.useState(
    Boolean(props.minusDisabled)
  );

  const {
    small,
    inputLabel,
    inputValue: propInputValue,
    disabled: propIsDisabled,
    minusDisabled: propMinusIsDisabled,
    ...rest
  } = props;

  React.useEffect(() => {
    inputValue !== 0 ? setMinusIsDisabled(false) : setMinusIsDisabled(true);
  }, [inputValue]);

  React.useEffect(() => {
    setIsDisabled(isDisabled);
  }, [isDisabled]);

  React.useEffect(() => {
    setInputValue(inputValue);
  }, [inputValue]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(parseInt(e.target.value, 10));
  };

  const incrementValue = () => setInputValue(inputValue + 1);

  const decrementValue = () => {
    if (inputValue > 0) {
      setInputValue(inputValue - 1);
    }
  };

  const classes = useStyles();
  return (
    <React.Fragment>
      <div
        className={classnames({
          [classes.small]: small === true,
          [classes.inputGroup]: true
        })}
      >
        <Button
          buttonType="primary"
          className={classes.button}
          data-qa-button="primary"
          compact
          aria-label="Subtract 1"
          name="Subtract 1"
          onClick={decrementValue}
          disabled={isDisabled || minusIsDisabled}
        >
          <Minus className={classes.minusIcon} />
        </Button>
        <TextField
          {...rest}
          className={classes.textField}
          type="number"
          min={0}
          label={inputLabel ? inputLabel : 'Edit Quantity'}
          name="Quantity"
          hideLabel
          small={small}
          value={inputValue}
          onChange={onChange}
          inputProps={{
            className: classnames({
              [classes.input]: true
            })
          }}
          autoFocus={true}
          disabled={isDisabled}
        />
        <Button
          buttonType="primary"
          compact
          className={classes.button}
          data-qa-button="primary"
          aria-label="Add 1"
          name="Add 1"
          onClick={incrementValue}
          disabled={isDisabled}
        >
          <Plus className={classes.plusIcon} />
        </Button>
      </div>
    </React.Fragment>
  );
};

export default EnhancedNumberInput;
