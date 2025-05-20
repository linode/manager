import { CloseIcon } from '@linode/ui';
import Check from '@mui/icons-material/Check';
import Edit from '@mui/icons-material/Edit';
import React from 'react';
import type { PropsWithChildren } from 'react';
import { makeStyles } from 'tss-react/mui';

import { Button } from '../Button';
import { ClickAwayListener } from '../ClickAwayListener';
import { H1Header } from '../H1Header';
import { TextField } from '../TextField';

import type { TextFieldProps } from '../TextField';
import type { Theme } from '@mui/material/styles';

const useStyles = makeStyles<void, 'breadcrumbText' | 'editIcon' | 'icon'>()(
  (theme: Theme, _params, classes) => ({
    button: {
      '&[aria-label="Save"]': {
        marginLeft: theme.spacing(2),
        [theme.breakpoints.down('md')]: {
          marginLeft: theme.spacing(2),
        },
      },
      background: 'transparent !important',
      height: 34,
      marginLeft: 0,
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
      font: theme.font.bold,
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
    breadcrumbText: {
      color: theme.tokens.component.Breadcrumb.Normal.Text.Default,
      fontSize: '1rem !important',
      paddingBottom: 0,
      paddingLeft: 0,
      paddingTop: 0,
    },
  }),
);

interface BaseProps extends Omit<TextFieldProps, 'label'> {
  /**
   * The class name to apply to the container
   */
  className?: string;
  /**
   * Whether to disable the Breadcrumb edit button
   */
  disabledBreadcrumbEditButton?: boolean;
  /**
   * The error text to display
   */
  errorText?: string;
  /**
   * Send event analytics
   */
  handleAnalyticsEvent?: () => void;
  /**
   * Whether this EditableText is used as a breadcrumb
   */
  isBreadcrumb?: boolean;
  /**
   * Function to cancel editing and restore text to previous text
   */
  onCancel: () => void;
  /**
   * The function to handle saving edited text
   */
  onEdit: (_text: string) => Promise<void>;
  /**
   * The text inside the textbox
   */
  text: string;
  /**
   * Optional suffix to append to the text when it is not in editing mode
   */
  textSuffix?: string;
}

interface PropsWithoutLink extends BaseProps {
  labelLink?: never;
  LinkComponent?: never;
}

interface PropsWithLink extends BaseProps {
  /**
   * Optional link for the text when it is not in editing mode
   */
  labelLink: string;
  /**
   * A custom Link component that is required when passing a `labelLink` prop
   *
   * The component you pass must accept `className`, `to`, and `children` as props
   * - `to` is just the `labelLink` prop forwarded to this Link component
   * - `className` should be passed to your Link so that it has the correct styles
   * - `children` contains the link's text/children
   */
  LinkComponent: React.ComponentType<
    PropsWithChildren<{ className?: string; to: string }>
  >;
}

export type EditableTextProps = PropsWithLink | PropsWithoutLink;

export const EditableText = (props: EditableTextProps) => {
  const { classes, cx } = useStyles();

  const [isEditing, setIsEditing] = React.useState(Boolean(props.errorText));
  const [text, setText] = React.useState(props.text);
  const {
    LinkComponent,
    className,
    disabledBreadcrumbEditButton,
    errorText,
    handleAnalyticsEvent,
    isBreadcrumb,
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
      className={cx(classes.root, { [classes.breadcrumbText]: isBreadcrumb })}
      data-qa-editable-text
      title={`${text}${textSuffix ?? ''}`}
    />
  );

  return !isEditing && !errorText ? (
    <div
      className={cx(classes.container, classes.initial, className)}
      data-testid={'editable-text'}
    >
      {labelLink ? (
        <LinkComponent className={classes.underlineOnHover} to={labelLink}>
          {labelText}
        </LinkComponent>
      ) : (
        labelText
      )}
      {/** pencil icon */}
      <Button
        aria-label={`Edit ${text}`}
        className={cx(classes.button, classes.editIcon)}
        data-qa-edit-button
        disabled={disabledBreadcrumbEditButton}
        onClick={openEdit}
      >
        <Edit className={classes.icon} />
      </Button>
    </div>
  ) : (
    <ClickAwayListener mouseEvent="onMouseDown" onClickAway={cancelEditing}>
      <div className={cx(classes.container, className)} data-qa-edit-field>
        <TextField
          {...rest}
          // eslint-disable-next-line
          autoFocus={true}
          className={classes.textField}
          editable
          errorText={props.errorText}
          hideLabel
          inputProps={{
            className: cx(classes.input, {
              [classes.breadcrumbText]: isBreadcrumb,
            }),
          }}
          InputProps={{ className: classes.inputRoot }}
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
          <CloseIcon className={classes.icon} data-testid="CloseIcon" />
        </Button>
      </div>
    </ClickAwayListener>
  );
};
