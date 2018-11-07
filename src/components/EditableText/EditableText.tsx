import * as classnames from 'classnames';
import * as React from 'react';
import { Link } from 'react-router-dom';

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
    position: 'relative',
    top: 1,
  },
  initial: {
    border: '1px solid transparent',
    '&:hover, &:focus': {
      '& $editIcon': {
        position: 'relative',
        top: 0,
        left: 0,
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
  },
  headline: {
    ...theme.typography.headline,
  },
  title: {
    ...theme.typography.title,
  },
  editIcon: {
    [theme.breakpoints.up('sm')]: {
      position: 'absolute',
      top: '-9999px',
      left: '-9999px',
      '&:focus': {
        position: 'relative',
        top: 0,
        left: 0,
      },
    },
  },
});

interface Props {
  onEdit: (text: string) => void;
  onCancel: () => void;
  text: string;
  errorText?: string;
  labelLink?: string;
}

interface State {
  text: string;
  isEditing: Boolean;
}

type PassThroughProps = Props & TextFieldProps & TypographyProps;

type FinalProps =  PassThroughProps & WithStyles<ClassNames>;

export class EditableText extends React.Component<FinalProps, State> {
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
    const { classes, labelLink, onEdit, errorText, ...rest } = this.props;
    const { isEditing, text } = this.state;

    const staticText = (
      <Typography className={this.props.classes.root} { ...rest } data-qa-editable-text>
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
                    <Link to={labelLink!}>
                      {staticText}
                    </Link>
                  :
                    staticText
                }
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
