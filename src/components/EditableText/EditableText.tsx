import * as React from 'react';

import { TextFieldProps } from 'material-ui/TextField';

import  { withStyles, WithStyles, StyleRulesCallback, Theme } from 'material-ui';
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
  editing: Boolean;
}

type FinalProps = Props & WithStyles<ClassNames> & TextFieldProps;

class EditableText extends React.Component<FinalProps, State> {
  state = {
    editing: false,
    text: this.props.text,
  };

  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ text: e.target.value });
  }

  toggleEditing = () => {
    this.setState({ editing: !this.state.editing });
  }

  render() {
    const { classes, onEdit, ...rest } = this.props;
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
          <TextField
            className={classes.textField}
            type="text"
            onChange={this.onChange}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                this.toggleEditing();
                onEdit(text);
              }
            }}
            value={text}
            {...rest}
          />
        )
    );
  }
}

export default withStyles(styles, { withTheme: true })<Props>(EditableText);
