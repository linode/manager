import * as React from 'react';

import { TextFieldProps } from 'material-ui/TextField';

import  { withStyles, WithStyles, StyleRulesCallback, Theme } from 'material-ui';
import ClickAwayListener from 'material-ui/utils/ClickAwayListener';
import ModeEdit from 'material-ui-icons/ModeEdit';

import TextField from '../TextField';

type ClassNames = 'root' | 'editIcon' | 'textField';

const styles: StyleRulesCallback = (theme: Theme & Linode.Theme) => ({
  root: {
  },
  editIcon: {
  },
  textField: {
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

type FinalProps = Props & WithStyles<ClassNames> & TextFieldProps;

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
          <React.Fragment>
            <span className={classes.root}>{text}</span>
            <ModeEdit onClick={this.toggleEditing} />
          </React.Fragment>
        )
        : (
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
            />
          </ClickAwayListener>
        )
    );
  }
}

export default withStyles(styles, { withTheme: true })<Props>(EditableText);
