import Check from '@material-ui/icons/Check';
import Close from '@material-ui/icons/Close';
import Edit from '@material-ui/icons/Edit';
import * as classnames from 'classnames';
import * as React from 'react';
import Button from 'src/components/Button';
import ClickAwayListener from 'src/components/core/ClickAwayListener';
import { makeStyles, Theme } from 'src/components/core/styles';
import { TextFieldProps } from 'src/components/core/TextField';
import Typography from 'src/components/core/Typography';
import TextField from 'src/components/TextField';

const useStyles = makeStyles((theme: Theme) => ({
  '@keyframes fadeIn': {
    from: {
      opacity: 0
    },
    to: {
      opacity: 1
    }
  },
  root: {
    padding: '5px 8px',
    display: 'inline-block',
    transition: theme.transitions.create(['opacity']),
    wordBreak: 'break-all',
    textDecoration: 'inherit',
    lineHeight: 1
  },
  container: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'relative'
  },
  initial: {
    '&:hover, &:focus': {
      '& $editIcon': {
        opacity: 1
      },
      '& $icon': {
        color: theme.color.grey1,
        '&:hover': {
          color: theme.color.black
        }
      }
    }
  },
  edit: {
    fontSize: 22,
    border: '1px solid transparent'
  },
  textField: {
    opacity: 0,
    animation: '$fadeIn .3s ease-in-out forwards',
    margin: 0
  },
  inputRoot: {
    maxWidth: 170,
    borderColor: `${theme.palette.primary.main} !important`,
    backgroundColor: 'transparent',
    boxShadow: 'none',
    minHeight: 40,
    [theme.breakpoints.up('md')]: {
      maxWidth: 415,
      width: '100%'
    }
  },
  button: {
    padding: 0,
    height: 24,
    width: 24,
    minWidth: 'auto',
    minHeight: 'auto',
    marginTop: 0,
    background: 'transparent !important'
  },
  icon: {
    margin: '0 10px',
    color: theme.palette.text.primary,
    '&:hover, &:focus': {
      color: theme.palette.primary.light
    }
  },
  saveButton: {
    marginLeft: 8,
    marginRight: 8
  },
  save: {
    fontSize: 26
  },
  close: {
    fontSize: 26
  },
  input: {
    padding: '5px 8px',
    ...theme.typography.body1
  },
  headline: {
    ...theme.typography.h1
  },
  title: {
    ...theme.typography.h1
  },
  editIcon: {
    position: 'absolute',
    right: 10,
    [theme.breakpoints.up('sm')]: {
      opacity: 0,
      '&:focus': {
        opacity: 1
      }
    }
  }
}));

export type EditableTextVariant = 'h1' | 'h2' | 'table-cell';

interface Props {
  onEdit: () => void;
  openForEdit: () => void;
  cancelEdit: () => void;
  onInputChange: (text: string) => void;
  text: string;
  errorText?: string;
  editable?: boolean;
  typeVariant: EditableTextVariant;
  className?: string;
  inputText: string;
  isEditing: boolean;
  loading: boolean;
}

type PassThroughProps = Props & TextFieldProps;

type FinalProps = PassThroughProps;

export const EditableInput: React.FC<FinalProps> = props => {
  const {
    errorText,
    editable,
    onEdit,
    openForEdit,
    cancelEdit,
    onInputChange,
    text,
    typeVariant,
    className,
    isEditing,
    inputText,
    loading,
    ...rest
  } = props;

  /** confirm or cancel edits if the enter or escape keys are pressed, respectively */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onEdit();
    }
    if (e.key === 'Escape' || e.key === 'Esc') {
      cancelEdit();
    }
  };

  const classes = useStyles();

  const labelText = (
    <Typography
      className={className ? className : classes.root}
      variant={typeVariant === 'table-cell' ? 'body1' : 'h1'}
      data-qa-editable-text
    >
      <strong>{text}</strong>
    </Typography>
  );

  return !isEditing && !errorText ? (
    <div
      className={`${classes.container} ${classes.initial} ${className}`}
      data-testid={'editable-text'}
    >
      <React.Fragment>
        {labelText}
        {/** pencil icon */}
        <Button
          className={`${classes.button} ${classes.editIcon}`}
          onClick={openForEdit}
          data-qa-edit-button
          aria-label={`Edit ${labelText}`}
        >
          <Edit className={`${classes.icon} ${classes.edit}`} />
        </Button>
      </React.Fragment>
    </div>
  ) : (
    <ClickAwayListener onClickAway={cancelEdit} mouseEvent="onMouseDown">
      <div
        className={`${classes.container} ${classes.edit} ${className}`}
        data-qa-edit-field
      >
        <TextField
          {...rest}
          loading={loading}
          className={classes.textField}
          type="text"
          onChange={(e: any) => onInputChange(e.target.value)}
          onKeyDown={handleKeyPress}
          value={inputText}
          errorText={errorText}
          InputProps={{ className: classes.inputRoot }}
          inputProps={{
            className: classnames({
              [classes.headline]: typeVariant === 'h1',
              [classes.title]: typeVariant === 'h2',
              [classes.input]: true
            })
          }}
          autoFocus={true}
          editable
        />
        {!loading && (
          <>
            <Button
              className={`${classes.button} ${classes.saveButton}`}
              onClick={() => onEdit()}
              data-qa-save-edit
            >
              <Check className={`${classes.icon} ${classes.save}`} />
            </Button>
            <Button
              className={classes.button}
              onClick={cancelEdit}
              data-qa-cancel-edit
            >
              <Close className={`${classes.icon} ${classes.close}`} />
            </Button>
          </>
        )}
      </div>
    </ClickAwayListener>
  );
};

export default EditableInput;
