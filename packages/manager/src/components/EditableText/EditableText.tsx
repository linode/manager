import Check from '@material-ui/icons/Check';
import Close from '@material-ui/icons/Close';
import Edit from '@material-ui/icons/Edit';
import * as classnames from 'classnames';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import ClickAwayListener from 'src/components/core/ClickAwayListener';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import { TextFieldProps } from 'src/components/core/TextField';
import H1Header from 'src/components/H1Header';
import TextField from '../TextField';

type ClassNames =
  | 'root'
  | 'container'
  | 'initial'
  | 'edit'
  | 'textField'
  | 'inputRoot'
  | 'input'
  | 'button'
  | 'icon'
  | 'save'
  | 'close'
  | 'headline'
  | 'title'
  | 'editIcon'
  | 'underlineOnHover';

const styles = (theme: Theme) =>
  createStyles({
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
      border: '1px solid transparent',
      transition: theme.transitions.create(['opacity']),
      wordBreak: 'break-all',
      textDecoration: 'inherit',
      lineHeight: 1
    },
    container: {
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      maxHeight: 48,
      position: 'relative'
    },
    initial: {
      border: '1px solid transparent',
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
      minWidth: 'auto',
      minHeight: 48,
      padding: 0,
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
    save: {
      fontSize: 26
    },
    close: {
      fontSize: 26
    },
    input: {
      padding: '5px 8px',
      ...theme.typography.h1
    },
    headline: {
      ...theme.typography.h1
    },
    title: {
      ...theme.typography.h1
    },
    editIcon: {
      [theme.breakpoints.up('sm')]: {
        opacity: 0,
        '&:focus': {
          opacity: 1
        }
      }
    },
    underlineOnHover: {
      '&:hover, &:focus': {
        textDecoration: 'underline !important'
      }
    }
  });

interface Props {
  onEdit: (text: string) => Promise<any>;
  onCancel: () => void;
  text: string;
  errorText?: string;
  labelLink?: string;
  typeVariant: string;
  className?: string;
}

type PassThroughProps = Props & TextFieldProps;

type FinalProps = PassThroughProps & WithStyles<ClassNames>;

const EditableText: React.FC<FinalProps> = props => {
  const [isEditing, setIsEditing] = React.useState(Boolean(props.errorText));
  const [text, setText] = React.useState(props.text);
  const {
    classes,
    labelLink,
    errorText,
    onEdit,
    onCancel,
    text: propText,
    typeVariant,
    className,
    ...rest
  } = props;

  React.useEffect(() => {
    setText(props.text);
  }, [props.text]);

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
        .catch(e => e);
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
      <React.Fragment>
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
          aria-label={`Edit ${labelText}`}
        >
          <Edit className={`${classes.icon} ${classes.edit}`} />
        </Button>
      </React.Fragment>
    </div>
  ) : (
    <ClickAwayListener onClickAway={cancelEditing} mouseEvent="onMouseDown">
      <div
        className={`${classes.container} ${classes.edit} ${className}`}
        data-qa-edit-field
      >
        <TextField
          {...rest}
          className={classes.textField}
          type="text"
          label={`Edit ${text} Label`}
          hideLabel
          onChange={onChange}
          onKeyDown={handleKeyPress}
          value={text}
          errorText={props.errorText}
          InputProps={{ className: classes.inputRoot }}
          inputProps={{
            className: classnames({
              [classes.headline]: typeVariant === 'h1',
              [classes.title]: typeVariant === 'h2',
              [classes.input]: true
            })
          }}
          autoFocus={true}
        />
        <Button
          className={classes.button}
          onClick={finishEditing}
          data-qa-save-edit
        >
          <Check className={`${classes.icon} ${classes.save}`} />
        </Button>
        <Button
          className={classes.button}
          onClick={cancelEditing}
          data-qa-cancel-edit
        >
          <Close className={`${classes.icon} ${classes.close}`} />
        </Button>
      </div>
    </ClickAwayListener>
  );
};

const styled = withStyles(styles);

export default compose<FinalProps, PassThroughProps>(styled)(EditableText);
