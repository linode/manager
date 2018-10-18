import * as classnames from 'classnames';
import * as React from 'react';

import Button from '@material-ui/core/Button';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import { TextFieldProps } from '@material-ui/core/TextField';
import Typography, { TypographyProps } from '@material-ui/core/Typography';
import Check from '@material-ui/icons/Check';
import Close from '@material-ui/icons/Close';
import ModeEdit from '@material-ui/icons/ModeEdit';

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
| 'editIcon';

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
  },
  container: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    maxHeight: 48,
  },
  initial: {
    border: '1px solid transparent',
    '&:hover, &:focus': {
      border: '1px solid #abadaf',
      '& $editIcon': {
        visibility: 'visible',
      },
      '& $icon': {
        color: theme.color.grey1,
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
    [theme.breakpoints.up('md')]: {
      maxWidth: 415,
      width: '100%',
    },
  },
  button: {
    minWidth: 'auto',
    padding: 0,
    marginTop: 0,
    background: 'transparent !important',
  },
  icon: {
    margin: '0 10px',
    color: theme.palette.text.primary,
    transition: theme.transitions.create(['color']),
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
  },
  headline: {
    ...theme.typography.headline,
  },
  title: {
    ...theme.typography.title,
  },
  editIcon: {
    [theme.breakpoints.up('lg')]: {
      visibility: 'hidden',
    },
  },
});

interface Props {
  onEdit: (text: string) => void;
  onCancel: () => void;
  text: string;
  errorText?: string;
}

interface State {
  text: string;
  isEditing: Boolean;
}

type PassThroughProps = Props & TextFieldProps & TypographyProps;

type FinalProps =  PassThroughProps & WithStyles<ClassNames>;

class EditableText extends React.Component<FinalProps, State> {
  state: State = {
    isEditing: Boolean(this.props.errorText),
    text: this.props.text,
  };

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.text !== this.state.text) {
      this.setState({ text: nextProps.text });
    }
    if (nextProps.errorText) {
      this.setState({ isEditing: true });
    } else {
      this.setState({ isEditing: false });
    }
  }

  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ text: e.target.value });
  }

  toggleEditing = () => {
    this.setState({ isEditing: !this.state.isEditing });
  }

  finishEditing = (text: string) => {
    if (text === this.props.text && !this.props.errorText) {
      this.setState({ isEditing: false });
    }
    this.props.onEdit(text);
  }

  cancelEditing = () => {
    this.props.onCancel();
  }

  handleSaveEdit = () => {
    this.finishEditing(this.state.text);
  }

  handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { this.finishEditing(this.state.text); }
    if (e.key === 'Escape' || e.key === 'Esc') { this.cancelEditing(); }
  }

  render() {
    const { classes, onEdit, errorText, ...rest } = this.props;
    const { isEditing, text } = this.state;

    return (
      !isEditing
        ? (
            <div className={`${classes.container} ${classes.initial}`}>
              <React.Fragment>
                <Typography
                  className={classes.root}
                  onClick={this.toggleEditing}
                  {...rest}
                  data-qa-editable-text
                >
                  {text}
                </Typography>
                <Button
                  className={`${classes.button} ${classes.editIcon}`}
                  onClick={this.toggleEditing}
                  data-qa-edit-button
                >
                  <ModeEdit className={`${classes.icon} ${classes.edit}`}/>
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
                      [classes.headline]: this.props.variant === 'headline',
                      [classes.title]: this.props.variant === 'title',
                      [classes.input]: true,
                    }),
                  }}
                  autoFocus={true}
                />
                <Button
                  className={classes.button}
                  onClick={this.handleSaveEdit}
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

export default withStyles(styles, { withTheme: true })<PassThroughProps>(EditableText);
