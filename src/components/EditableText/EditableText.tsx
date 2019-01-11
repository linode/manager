import Check from '@material-ui/icons/Check';
import Close from '@material-ui/icons/Close';
import Edit from '@material-ui/icons/Edit';
import * as classnames from 'classnames';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Button from 'src/components/Button';
import ClickAwayListener from 'src/components/core/ClickAwayListener';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import { TextFieldProps } from 'src/components/core/TextField';
import Typography, { TypographyProps } from 'src/components/core/Typography';
import TextField from '../TextField';

type ClassNames = 'root'
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

const styles: StyleRulesCallback = (theme) => ({
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
  },
  root: {
    padding: '5px 10px',
    display: 'inline-block',
    border: '1px solid transparent',
    transition: theme.transitions.create(['opacity']),
    wordBreak: 'break-all',
    textDecoration: 'inherit',
  },
  container: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    maxHeight: 48,
    position: 'relative',
    top: 0,
    left: -2.
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
  edit: {
    fontSize: 22,
    border: '1px solid transparent',
  },
  textField: {
    opacity: 0,
    animation: 'fadeIn .3s ease-in-out forwards',
    margin: 0,
  },
  inputRoot: {
    maxWidth: 170,
    borderColor: `${theme.palette.primary.main} !important`,
    backgroundColor: 'transparent',
    boxShadow: 'none',
    [theme.breakpoints.up('md')]: {
      maxWidth: 415,
      width: '100%',
    },
  },
  button: {
    minWidth: 'auto',
    minHeight: 48,
    padding: 0,
    marginTop: 0,
    background: 'transparent !important',
  },
  icon: {
    margin: '0 10px',
    color: theme.palette.text.primary,
    '&:hover, &:focus': {
      color: theme.palette.primary.light,
    },
  },
  save: {
    fontSize: 26,
  },
  close: {
    fontSize: 26,
  },
  input: {
    padding: '5px 10px',
    ...theme.typography.h1,
  },
  headline: {
    ...theme.typography.h1,
  },
  title: {
    ...theme.typography.h1,
  },
  editIcon: {
    [theme.breakpoints.up('sm')]: {
      opacity: 0,
      '&:focus': {
        opacity: 1,
      },
    },
  },
  underlineOnHover: {
    '&:hover, &:focus': {
      textDecoration: 'underline !important',
    },
  }
});

interface Props {
  onEdit: (text: string) => Promise<any>;
  onCancel: () => void;
  text: string;
  errorText?: string;
  labelLink?: string;
  typeVariant: string;
}

interface State {
  text: string;
  isEditing: Boolean;
}

type PassThroughProps = Props & TextFieldProps & TypographyProps;

type FinalProps = PassThroughProps & WithStyles<ClassNames>;

export class EditableText extends React.Component<FinalProps, State> {
  state: State = {
    isEditing: Boolean(this.props.errorText),
    text: this.props.text,
  };

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { text: prevText } = prevProps;
    const { text } = this.props;
    if (text !== prevText) {
      this.setState({ text });
    }
  }

  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ text: e.target.value });
  }

  openEdit = () => {
    this.setState({ isEditing: true });
  }

  finishEditing = () => {
    const { text } = this.state;
    /**
     * if the entered text is different from the original text
     * provided, run the update callback
     *
     * only exit editing mode if promise resolved
     */
    if (text !== this.props.text) {
      this.props.onEdit(text)
        .then(() => {
          this.setState({ isEditing: false })
        })
        .catch(e => e);
    }
  }

  cancelEditing = () => {
    /** cancel editing and invoke callback function and revert text to original */
    this.setState({ isEditing: false, text: this.props.text }, () => {
      this.props.onCancel()
    })
  }

  /** confirm or cancel edits if the enter or escape keys are pressed, respectively */
  handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { this.finishEditing(); }
    if (e.key === 'Escape' || e.key === 'Esc') { this.cancelEditing(); }
  }


  render() {
    const { classes, labelLink, onEdit, errorText, typeVariant, ...rest } = this.props;
    const { isEditing, text } = this.state;

    const labelText = (
      <Typography className={classes.root} {...rest} variant="h1" data-qa-editable-text>
        {this.state.text}
      </Typography>
    );

    return (
      !isEditing
        ? (
          <div className={`${classes.container} ${classes.initial}`}>
            <React.Fragment>
              {!!labelLink
                ?
                <Link to={labelLink!} className={classes.underlineOnHover}>
                  {labelText}
                </Link>
                :
                labelText
              }
              {/** pencil icon */}
              <Button
                className={`${classes.button} ${classes.editIcon}`}
                onClick={this.openEdit}
                data-qa-edit-button
                aria-label={`Edit ${labelText}`}
              >
                <Edit className={`${classes.icon} ${classes.edit}`} />
              </Button>
            </React.Fragment>
          </div>
        )
        : (
          <ClickAwayListener
            onClickAway={this.cancelEditing}
            mouseEvent="onMouseDown"
          >
            <div className={`${classes.container} ${classes.edit}`} data-qa-edit-field>
              <TextField
                className={classes.textField}
                type="text"
                onChange={this.onChange}
                onKeyDown={this.handleKeyPress}
                value={text}
                errorText={this.props.errorText}
                {...rest}
                InputProps={{ className: classes.inputRoot }}
                inputProps={{
                  className: classnames({
                    [classes.headline]: this.props.typeVariant === 'h1',
                    [classes.title]: this.props.typeVariant === 'h2',
                    [classes.input]: true,
                  }),
                }}
                autoFocus={true}
              />
              <Button
                className={classes.button}
                onClick={this.finishEditing}
                data-qa-save-edit
              >
                <Check
                  className={`${classes.icon} ${classes.save}`}
                />
              </Button>
              <Button
                className={classes.button}
                onClick={this.cancelEditing}
                data-qa-cancel-edit
              >
                <Close
                  className={`${classes.icon} ${classes.close}`}
                />
              </Button>
            </div>
          </ClickAwayListener>
        )
    );
  }
}

const styled = withStyles(styles);

export default styled(EditableText);
