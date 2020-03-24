import * as classnames from 'classnames';
import * as React from 'react';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import { TextFieldProps } from 'src/components/core/TextField';
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
    }
  }
}));

interface Props {
  // onEdit: () => void;
  // openForEdit: () => void;
  // cancelEdit: () => void;
  // onInputChange: (text: string) => void;
  // text: string;
  small?: boolean;
  // typeVariant: EditableTextVariant;
  // className?: string;
  // inputText: string;
  // isEditing: boolean;
  // loading: boolean;
}

type PassThroughProps = Props & TextFieldProps;

type FinalProps = PassThroughProps;

export const EnhancedNumberInput: React.FC<FinalProps> = props => {
  const {
    small,
    // onEdit,
    // openForEdit,
    // cancelEdit,
    // isEditing,
    // onInputChange,
    // text,
    // typeVariant,
    // className,
    // inputText,
    // loading,
    ...rest
  } = props;

  /** confirm or cancel edits if the enter or escape keys are pressed, respectively */
  // const handleKeyPress = (e: React.KeyboardEvent) => {
  //   if (e.key === 'Enter') {
  //     onEdit();
  //   }
  //   if (e.key === 'Escape' || e.key === 'Esc') {
  //     cancelEdit();
  //   }
  // };

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
          value="-"
          className={classes.button}
          data-qa-button="primary"
          compact
          aria-label="Subtract 1"
        >
          -
        </Button>
        {/* <input
          type="number"
          step="1"
          max=""
          value="1"
          name="quantity"
          className={classes.input}
        /> */}
        <TextField
          {...rest}
          className={classes.textField}
          type="number"
          label="Edit Quantity"
          hideLabel
          small={small}
          // onChange={(e: any) => onInputChange(e.target.value)}
          // onKeyDown={handleKeyPress}
          // value={inputText}
          // errorText={errorText}
          // InputProps={{ className: classes.inputRoot }}
          inputProps={{
            className: classnames({
              [classes.input]: true
            })
          }}
          autoFocus={true}
        />
        <Button
          buttonType="primary"
          value="+"
          compact
          className={classes.button}
          data-qa-button="primary"
          aria-label="Add 1"
        >
          +
        </Button>
      </div>
    </React.Fragment>
  );
};

export default EnhancedNumberInput;
