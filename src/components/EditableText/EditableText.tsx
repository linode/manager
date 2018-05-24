import * as React from 'react';
import * as classnames from 'classnames';

import { TextFieldProps } from 'material-ui/TextField';
import Typography, { TypographyProps } from 'material-ui/Typography';

import  { withStyles, WithStyles, StyleRulesCallback, Theme } from 'material-ui';
import Button from 'material-ui/Button';
import ClickAwayListener from 'material-ui/utils/ClickAwayListener';
import ModeEdit from 'material-ui-icons/ModeEdit';
import Save from 'material-ui-icons/Check';
import Close from 'material-ui-icons/Close';
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
| 'title';

const styles: StyleRulesCallback = (theme: Theme & Linode.Theme) => ({
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
  },
  root: {
    padding: '12px 12px 10px 0',
    display: 'inline-block',
    borderBottom: '2px dotted transparent',
    transition: theme.transitions.create(['opacity']),
  },
  container: {
    display: 'inline-flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  initial: {
    '&:hover, &:focus': {
      '& $root': {
        opacity: .5,
      },
      '& $icon': {
        color: theme.palette.primary.light,
      },
    },
  },
  edit: {
    fontSize: 22,
  },
  textField: {
    opacity: 0,
    animation: 'fadeIn .3s ease-in-out forwards',
    margin: 0,
  },
  inputRoot: {
    border: 0,
    borderBottom: `2px dotted ${theme.color.black}`,
    backgroundColor: 'transparent',
  },
  button: {
    minWidth: 'auto',
    padding: 0,
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
    padding: '12px 12px 10px 0',
  },
  headline: {
    ...theme.typography.headline,
  },
  title: {
    ...theme.typography.title,
  },
});

interface Props {
  onEdit: (text: string) => void;
  text: string;
  isEditing: Boolean;
  errorText?: string;
}

interface State {
  text: string;
  savedText: string;
  editing: Boolean;
}

type PassThroughProps = Props & TextFieldProps & TypographyProps;

type FinalProps =  PassThroughProps & WithStyles<ClassNames>;

class EditableText extends React.Component<FinalProps, State> {
  state = {
    editing: this.props.isEditing,
    savedText: this.props.text,
    text: this.props.text,
  };

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.text !== this.state.text) {
      this.setState({ text: nextProps.text });
    }
    this.setState({ editing: nextProps.isEditing });
  }

  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ text: e.target.value });
  }

  toggleEditing = () => {
    if (!this.state.editing) {
      this.setState({ savedText: this.state.text });
    }
    this.setState({ editing: !this.state.editing });
  }

  finishEditing = (text: string) => {
    if (text === this.props.text && !this.props.errorText) {
      this.setState({ editing: false });
    } else {
      this.props.onEdit(text);
    }
  }

  cancelEditing = () => {
    this.setState({ text: this.state.savedText });
    this.setState({ editing: false });
  }

  render() {
    const { classes, onEdit, isEditing, errorText, ...rest } = this.props;
    const { editing, text } = this.state;

    return (
      !editing
        ? (
            <div className={`${classes.container} ${classes.initial}`}>
              <React.Fragment>
                <Typography
                  className={classes.root}
                  onClick={this.toggleEditing}
                  {...rest}
                >
                  {text}
                </Typography>
                <Button
                  className={classes.button}
                  onClick={this.toggleEditing}
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { this.finishEditing(text); }
                    if (e.key === 'Escape' || e.key === 'Esc') { this.cancelEditing(); }
                  }}
                  value={text}
                  errorText={errorText}
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
                  onClick={() => {
                    this.finishEditing(text);
                  }}
                  data-qa-save-edit
                >
                  <Save
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
