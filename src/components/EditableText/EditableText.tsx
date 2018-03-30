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
    padding: '12px 12px 12px 0',
    display: 'inline-block',
    borderBottom: '2px dotted transparent',
    color: theme.palette.primary.main,
  },
  container: {
    display: 'inline-flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  initial: {
    '&:hover, &:focus': {
      color: theme.palette.primary.light,
      '& $icon': {
        color: theme.palette.primary.light,
      },
    },
  },
  edit: {
    animation: 'fadeIn 500ms ease-in-out',
  },
  textField: {
    margin: 0,
  },
  inputRoot: {
    border: 0,
    borderBottom: '2px dotted #333',
  },
  button: {
    minWidth: 'auto',
    padding: 0,
    background: 'transparent !important',
  },
  icon: {
    fontSize: 20,
    padding: 10,
    color: theme.palette.text.primary,
    '&:hover, &:focus': {
      color: theme.palette.primary.light,
    },
  },
  save: {
  },
  close: {
  },
  input: {
    padding: '12px 12px 12px 0',
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
    editing: false,
    savedText: this.props.text,
    text: this.props.text,
  };

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
    this.props.onEdit(text);
    this.setState({ editing: false });
  }

  cancelEditing = () => {
    this.setState({ text: this.state.savedText });
    this.setState({ editing: false });
  }

  render() {
    const { classes, ...rest } = this.props;
    const { editing, text } = this.state;

    return (
      !editing
        ? (
            <div className={`${classes.container} ${classes.initial}`}>
              <React.Fragment>
                <Typography
                  className={classes.root}
                  {...rest}
                >
                  {text}
                </Typography>
                <Button className={classes.button}>
                  <ModeEdit
                    className={classes.icon}
                    onClick={this.toggleEditing}
                  />
                </Button>
              </React.Fragment>
            </div>
          )
          : (
            <div className={`${classes.container} ${classes.edit}`}>
              <ClickAwayListener
                onClickAway={this.cancelEditing}
              >
              <TextField
                className={classes.textField}
                type="text"
                onChange={this.onChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { this.finishEditing(text); }
                  if (e.key === 'Escape' || e.key === 'Esc') { this.cancelEditing(); }
                }}
                value={text}
                {...rest}
                InputProps={{ className: classes.inputRoot }}
                inputProps={{
                  className: classnames({
                    [classes.headline]: this.props.variant === 'headline',
                    [classes.title]: this.props.variant === 'title',
                    [classes.input]: true,
                  }),
                }}
              />
              <Button className={classes.button}>
                <Save
                  className={`${classes.icon} ${classes.save}`}
                />
              </Button>
              <Button className={classes.button}>
                <Close
                  className={`${classes.icon} ${classes.close}`}
                  onClick={this.cancelEditing}
                  />
              </Button>
            </ClickAwayListener>
          </div>
        )
    );
  }
}

export default withStyles(styles, { withTheme: true })<PassThroughProps>(EditableText);
