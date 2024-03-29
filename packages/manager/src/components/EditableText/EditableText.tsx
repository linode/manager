import Check from '@mui/icons-material/Check';
import Close from '@mui/icons-material/Close';
import Edit from '@mui/icons-material/Edit';
import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';

import { Button } from 'src/components/Button/Button';
import { ClickAwayListener } from 'src/components/ClickAwayListener';
import { H1Header } from 'src/components/H1Header/H1Header';

import { TextField, TextFieldProps } from '../TextField';

const useStyles = makeStyles<void, 'editIcon' | 'icon'>()(
  (theme: Theme, _params, classes) => ({
    button: {
      '&:first-of-type': {
        marginLeft: theme.spacing(2),
        [theme.breakpoints.down('md')]: {
          marginLeft: theme.spacing(2),
        },
      },
      background: 'transparent !important',
      marginLeft: 0,
      marginTop: 2,
      minWidth: 'auto',
      paddingLeft: 6,
      paddingRight: 6,
    },
    container: {
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'flex-start',
      position: 'relative',
    },
    editIcon: {
      [theme.breakpoints.up('sm')]: {
        '&:focus': {
          opacity: 1,
        },
        opacity: 0,
      },
    },
    icon: {
      '&:hover, &:focus': {
        color: theme.palette.primary.light,
      },
      color: theme.palette.text.primary,
      fontSize: '1.25rem',
      minHeight: 34,
    },
    initial: {
      '&:hover, &:focus': {
        [`& .${classes.editIcon}`]: {
          opacity: 1,
        },
        [`& .${classes.icon}`]: {
          '&:hover': {
            color: theme.color.black,
          },
          color: theme.color.grey1,
        },
      },
      borderLeft: '1px solid transparent',
    },
    input: {
      fontFamily: theme.font.bold,
      fontSize: '1.125rem',
      padding: 0,
      paddingLeft: 2,
    },
    inputRoot: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      marginLeft: 7,
      [theme.breakpoints.up('md')]: {
        maxWidth: 415,
        width: '100%',
      },
    },
    root: {
      border: '1px solid transparent',
      color: theme.textColors.tableStatic,
      display: 'inline-block',
      fontSize: '1.125rem !important',
      lineHeight: 1,
      padding: '5px 8px',
      textDecoration: 'inherit',
      transition: theme.transitions.create(['opacity']),
      wordBreak: 'break-all',
    },
    textField: {
      margin: 0,
    },
    underlineOnHover: {
      '&:hover, &:focus': {
        textDecoration: 'underline !important',
      },
    },
  })
);

interface Props {
  className?: string;
  disabledBreadcrumbEditButton?: boolean;
  errorText?: string;
  /**
   * Send event analytics
   */
  handleAnalyticsEvent?: () => void;
  /**
   * Optional link for the text when it is not in editing mode
   */
  labelLink?: string;
  /**
   * Function to cancel editing and restore text to previous text
   */
  onCancel: () => void;
  /**
   * The function to handle saving edited text
   */
  onEdit: (text: string) => Promise<any>;
  /**
   * The text inside the textbox
   */
  text: string;
  /**
   * Optional suffix to append to the text when it is not in editing mode
   */
  textSuffix?: string;
}

interface PassThroughProps extends Props, Omit<TextFieldProps, 'label'> {}

export const EditableText = (props: PassThroughProps) => {
  const { classes } = useStyles();

  const [isEditing, setIsEditing] = React.useState(Boolean(props.errorText));
  const [text, setText] = React.useState(props.text);
  const {
    className,
    disabledBreadcrumbEditButton,
    errorText,
    handleAnalyticsEvent,
    labelLink,
    onCancel,
    onEdit,
    text: propText,
    textSuffix,
    ...rest
  } = props;

  React.useEffect(() => {
    setText(propText);
  }, [propText]);

  React.useEffect(() => {
    onCancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const openEdit = () => {
    // Send analytics when pencil icon is clicked.
    if (handleAnalyticsEvent) {
      handleAnalyticsEvent();
    }
    setIsEditing(true);
  };

  const finishEditing = () => {
    /**
     * if the entered text is different from the original text
     * provided, run the update callback
     *
     * only exit editing mode if promise resolved
     */
    if (text !== propText) {
      onEdit(text)
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
    <H1Header
      className={classes.root}
      data-qa-editable-text
      title={`${text}${textSuffix ?? ''}`}
    />
  );

  return !isEditing && !errorText ? (
    <div
      className={`${classes.container} ${classes.initial} ${className}`}
      data-testid={'editable-text'}
    >
      {!!labelLink ? (
        <Link className={classes.underlineOnHover} to={labelLink!}>
          {labelText}
        </Link>
      ) : (
        labelText
      )}
      {/** pencil icon */}
      <Button
        aria-label={`Edit ${text}`}
        className={`${classes.button} ${classes.editIcon}`}
        data-qa-edit-button
        disabled={disabledBreadcrumbEditButton}
        onClick={openEdit}
      >
        <Edit className={classes.icon} />
      </Button>
    </div>
  ) : (
    <ClickAwayListener mouseEvent="onMouseDown" onClickAway={cancelEditing}>
      <div className={`${classes.container} ${className}`} data-qa-edit-field>
        <TextField
          {...rest}
          inputProps={{
            className: classes.input,
          }}
          InputProps={{ className: classes.inputRoot }}
          // eslint-disable-next-line
          autoFocus={true}
          className={classes.textField}
          editable
          errorText={props.errorText}
          hideLabel
          label={`Edit ${text} Label`}
          onChange={onChange}
          onKeyDown={handleKeyPress}
          type="text"
          value={text}
        />
        <Button
          aria-label="Save"
          className={classes.button}
          data-qa-save-edit
          onClick={finishEditing}
        >
          <Check className={classes.icon} />
        </Button>
        <Button
          aria-label="Cancel"
          className={classes.button}
          data-qa-cancel-edit
          onClick={cancelEditing}
        >
          <Close className={classes.icon} />
        </Button>
      </div>
    </ClickAwayListener>
  );
};
