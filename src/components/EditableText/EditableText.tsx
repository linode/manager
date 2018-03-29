import * as React from 'react';

import { TextFieldProps } from 'material-ui/TextField';

import  { withStyles, WithStyles, StyleRulesCallback, Theme } from 'material-ui';
import ModeEdit from 'material-ui-icons/ModeEdit';
import TextField from '../TextField';

type ClassNames = 'root';

const styles: StyleRulesCallback = (theme: Theme & Linode.Theme) => ({
  root: {
  },
});

interface State {
  editing: Boolean;
}

type FinalProps = WithStyles<ClassNames> & TextFieldProps;

class EditableText extends React.Component<FinalProps, State> {
  state = {
    editing: false,
  };

  toggleEditing = () => {
    this.setState({ editing: !this.state.editing });
  }

  render() {
    const { classes, ...rest } = this.props;
    const { editing } = this.state;

    return (
      <TextField
        className={classes.root}
        disabled={editing === false}
        type="text"
        InputProps={{
          endAdornment: <ModeEdit onClick={this.toggleEditing}/>,
        }}
        {...rest}
      />
    );
  }
}

export default withStyles(styles, { withTheme: true })<{}>(EditableText);
