import Check from '@material-ui/icons/Check';
import Close from '@material-ui/icons/Close';
import Edit from '@material-ui/icons/Edit';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Button from 'src/components/Button';
import ClickAwayListener from 'src/components/core/ClickAwayListener';
import { makeStyles, Theme } from 'src/components/core/styles';
import { TextFieldProps } from 'src/components/core/TextField';
import H1Header from 'src/components/H1Header';
import TextField from '../TextField';

const useStyles = makeStyles((theme: Theme) => ({
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
  },
  root: {
    display: 'inline-block',
    border: '1px solid transparent',
    color: theme.cmrTextColors.tableStatic,
    fontSize: '1.125rem',
    lineHeight: 1,
    padding: '5px 8px',
    textDecoration: 'inherit',
    transition: theme.transitions.create(['opacity']),
    wordBreak: 'break-all',
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    maxHeight: 48,
    position: 'relative',
  },
  initial: {
    border: '1px solid transparent',
    '&:hover, &:focus': {
      '& $editIcon': {
        opacity: 1,
      },
      '& $icon': {
        color: theme.color.grey1,
        '&:hover': {
          color: theme.color.black,
        },
      },
    },
  },
  textField: {
    opacity: 0,
    animation: '$fadeIn .3s ease-in-out forwards',
    margin: 0,
  },
  inputRoot: {
    backgroundColor: 'transparent',
    boxShadow: 'none',
    marginLeft: 7,
    maxWidth: 170,
    [theme.breakpoints.up('md')]: {
      maxWidth: 415,
      width: '100%',
    },
  },
  input: {
    fontFamily: theme.font.bold,
    fontSize: '1.125rem',
    padding: 0,
    paddingLeft: 2,
  },
  button: {
    background: 'transparent !important',
    marginTop: 2,
    marginLeft: 6,
    marginRight: 6,
    minWidth: 'auto',
    padding: 0,
  },
  icon: {
    color: theme.palette.text.primary,
    fontSize: '1.25rem',
    minHeight: 34,
    '&:hover, &:focus': {
      color: theme.palette.primary.light,
    },
  },
  editIcon: {
    [theme.breakpoints.up('sm')]: {
      opacity: 0,
      '&:focus': {
        opacity: 1,
      },
    },
  },
  saveIcon: {
    marginLeft: theme.spacing(),
  },
  headline: {
    ...theme.typography.h1,
  },
  underlineOnHover: {
    '&:hover, &:focus': {
      textDecoration: 'underline !important',
    },
  },
}));

interface Props {
  onEdit: (text: string) => Promise<any>;
  onCancel: () => void;
  text: string;
  errorText?: string;
  labelLink?: string;
  className?: string;
}

type PassThroughProps = Props & TextFieldProps;

type FinalProps = PassThroughProps;

const EditableText: React.FC<FinalProps> = (props) => {
  const classes = useStyles();

  const [isEditing, setIsEditing] = React.useState(Boolean(props.errorText));
  const [text, setText] = React.useState(props.text);
  const {
    labelLink,
    errorText,
    onEdit,
    onCancel,
    text: propText,
    className,
    ...rest
  } = props;

  React.useEffect(() => {
    setText(props.text);
  }, [props.text]);

  React.useEffect(() => {
    onCancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const openEdit = () => {
    setIsEditing(true);
  };

  const finishEditing = () => {
    /**
     * if the entered text is different from the original text
     * provided, run the update callback
     *
     * only exit editing mode if promise resolved
     */
    if (text !== props.text) {
      props
        .onEdit(text)
        .then(() => {
          setIsEditing(false);
        })
        .catch((e) => e);
    } else {
      /** otherwise, we've just submitted the form with no value change */
      setIsEditing(false);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setText(props.text);
  };

  /** confirm or cancel edits if the enter or escape keys are pressed, respectively */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      finishEditing();
    }
    if (e.key === 'Escape' || e.key === 'Esc') {
      cancelEditing();
    }
  };
  const labelText = (
    <H1Header title={text} className={classes.root} data-qa-editable-text />
  );

  return !isEditing && !errorText ? (
    <div
      className={`${classes.container} ${classes.initial} ${className}`}
      data-testid={'editable-text'}
    >
      {!!labelLink ? (
        <Link to={labelLink!} className={classes.underlineOnHover}>
          {labelText}
        </Link>
      ) : (
        labelText
      )}
      {/** pencil icon */}
      <Button
        className={`${classes.button} ${classes.editIcon}`}
        onClick={openEdit}
        data-qa-edit-button
        aria-label={`Edit ${text}`}
      >
        <Edit className={classes.icon} />
      </Button>
    </div>
  ) : (
    <ClickAwayListener onClickAway={cancelEditing} mouseEvent="onMouseDown">
      <div className={`${classes.container} ${className}`} data-qa-edit-field>
        <TextField
          {...rest}
          className={classes.textField}
          type="text"
          label={`Edit ${text} Label`}
          editable
          hideLabel
          onChange={onChange}
          onKeyDown={handleKeyPress}
          value={text}
          errorText={props.errorText}
          InputProps={{ className: classes.inputRoot }}
          inputProps={{
            className: classes.input,
          }}
          // eslint-disable-next-line
          autoFocus={true}
        />
        <Button
          className={classes.button}
          onClick={finishEditing}
          data-qa-save-edit
        >
          <Check className={`${classes.icon} ${classes.saveIcon}`} />
        </Button>
        <Button
          className={classes.button}
          onClick={cancelEditing}
          data-qa-cancel-edit
        >
          <Close className={classes.icon} />
        </Button>
      </div>
    </ClickAwayListener>
  );
};

export default EditableText;
