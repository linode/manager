import Check from '@mui/icons-material/Check';
import Close from '@mui/icons-material/Close';
import Edit from '@mui/icons-material/Edit';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import classNames from 'classnames';
import * as React from 'react';

import { Button } from 'src/components/Button/Button';
import { ClickAwayListener } from 'src/components/ClickAwayListener';
import { TextField, TextFieldProps } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';

const useStyles = makeStyles((theme: Theme) => ({
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
  },
  button: {
    background: 'transparent !important',
    height: 24,
    marginTop: 5,
    minHeight: 'auto',
    minWidth: 'auto',
    padding: 0,
    width: 24,
  },
  close: {
    fontSize: 26,
  },
  container: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  containerEditing: {
    alignItems: 'flex-start',
    display: 'flex',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  edit: {
    border: '1px solid transparent',
    fontSize: 22,
  },
  editIcon: {
    marginTop: '0 !important',
    position: 'absolute',
    right: 10,
    [theme.breakpoints.up('sm')]: {
      '&:focus': {
        opacity: 1,
      },
      opacity: 0,
    },
  },
  headline: {
    ...theme.typography.h1,
  },
  icon: {
    '&:hover, &:focus': {
      color: theme.palette.primary.light,
    },
    color: theme.palette.text.primary,
    margin: '0 10px',
  },
  initial: {
    '&:hover, &:focus': {
      '& $editIcon': {
        opacity: 1,
      },
      '& $icon': {
        '&:hover': {
          color: theme.color.black,
        },
        color: theme.color.grey1,
      },
    },
  },
  input: {
    padding: '5px 8px',
    ...theme.typography.body1,
  },
  inputRoot: {
    backgroundColor: 'transparent',
    borderColor: `${theme.palette.primary.main} !important`,
    boxShadow: 'none',
    maxWidth: 170,
    minHeight: 40,
    [theme.breakpoints.up('md')]: {
      maxWidth: 415,
      width: '100%',
    },
  },
  root: {
    display: 'inline-block',
    lineHeight: 1,
    padding: '5px 8px',
    textDecoration: 'inherit',
    transition: theme.transitions.create(['opacity']),
    wordBreak: 'break-all',
  },
  save: {
    fontSize: 26,
  },
  saveButton: {
    marginLeft: 8,
    marginRight: 8,
  },
  textField: {
    animation: '$fadeIn .3s ease-in-out forwards',
    margin: 0,
    opacity: 0,
  },
  title: {
    ...theme.typography.h1,
  },
}));

export type EditableTextVariant = 'h1' | 'h2' | 'table-cell';

interface Props {
  cancelEdit: () => void;
  className?: string;
  editable?: boolean;
  errorText?: string;
  inputText: string;
  isEditing: boolean;
  loading: boolean;
  onEdit: () => void;
  onInputChange: (text: string) => void;
  openForEdit: () => void;
  text: string;
  typeVariant: EditableTextVariant;
}

type PassThroughProps = Props & Omit<TextFieldProps, 'label'>;

type FinalProps = PassThroughProps;

export const EditableInput: React.FC<FinalProps> = (props) => {
  const {
    cancelEdit,
    className,
    editable,
    errorText,
    inputText,
    isEditing,
    loading,
    onEdit,
    onInputChange,
    openForEdit,
    text,
    typeVariant,
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
      aria-label={text}
      className={className ? className : classes.root}
      data-qa-editable-text
      variant={typeVariant === 'table-cell' ? 'body1' : 'h1'}
    >
      <strong>{text}</strong>
    </Typography>
  );

  return !isEditing && !errorText ? (
    <div
      className={`${classes.initial} ${className} ${classes.container}`}
      data-testid={'editable-text'}
    >
      {labelText}
      {/** pencil icon */}
      <Button
        aria-label={`Edit ${text}`}
        className={`${classes.button} ${classes.editIcon}`}
        data-qa-edit-button
        onClick={openForEdit}
      >
        <Edit className={`${classes.icon} ${classes.edit}`} />
      </Button>
    </div>
  ) : (
    <ClickAwayListener mouseEvent="onMouseDown" onClickAway={cancelEdit}>
      <div
        className={`${classes.containerEditing} ${classes.edit} ${className}`}
        data-qa-edit-field
      >
        <TextField
          {...rest}
          inputProps={{
            className: classNames({
              [classes.headline]: typeVariant === 'h1',
              [classes.input]: true,
              [classes.title]: typeVariant === 'h2',
            }),
          }}
          InputProps={{ className: classes.inputRoot }}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={true}
          className={classes.textField}
          editable
          errorText={errorText}
          hideLabel
          label="Edit Label"
          loading={loading}
          onChange={(e: any) => onInputChange(e.target.value)}
          onKeyDown={handleKeyPress}
          type="text"
          value={inputText}
        />
        {!loading && (
          <>
            <Button
              aria-label="Save new label"
              className={`${classes.button} ${classes.saveButton}`}
              data-qa-save-edit
              onClick={() => onEdit()}
            >
              <Check className={`${classes.icon} ${classes.save}`} />
            </Button>
            <Button
              aria-label="Cancel label edit"
              className={classes.button}
              data-qa-cancel-edit
              onClick={cancelEdit}
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
