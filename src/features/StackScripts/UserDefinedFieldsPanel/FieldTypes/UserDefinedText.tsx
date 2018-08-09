import * as React from 'react';

import { StyleRulesCallback, Theme, WithStyles, withStyles } from '@material-ui/core/styles';

import RenderGuard from 'src/components/RenderGuard';
import TextField from 'src/components/TextField';
import PasswordPanel from 'src/features/linodes/LinodesCreate/PasswordPanel';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    margin: `${theme.spacing.unit * 3}px 0`,
    paddingBottom: theme.spacing.unit * 3,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
});

interface Props {
  isPassword?: boolean;
  field: Linode.StackScript.UserDefinedField;
  updateFormState: (key: string, value: any) => void;
  udf_data: Linode.StackScript.UserDefinedField;
  isOptional: boolean;
  placeholder?: string;
}

interface State { }

type CombinedProps = Props & WithStyles<ClassNames>;

class UserDefinedText extends React.Component<CombinedProps, State> {
  state: State = {};

  renderTextField = () => {
    const { udf_data, field, placeholder, isOptional } = this.props;

    return (
      <TextField
        required={!isOptional}
        onChange={this.handleUpdateText}
        label={field.label}
        value={udf_data[field.name] || ''}
        placeholder={placeholder}
      />
    );
  }

  renderPasswordField = () => {
    const { udf_data, field, placeholder, isOptional } = this.props;

    return (
      <PasswordPanel
        required={!isOptional}
        password={udf_data[field.name] || ''}
        handleChange={this.handleUpdatePassword}
        label={field.label}
        noPadding
        placeholder={placeholder}
      />
    );
  }

  handleUpdateText = (e: any) => {
    const { updateFormState, field } = this.props;
    updateFormState(field.name, e.target.value);
  }

  handleUpdatePassword = (value: string) => {
    const { updateFormState, field } = this.props;
    updateFormState(field.name, value);
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        {this.props.isPassword
          ? this.renderPasswordField()
          : this.renderTextField()
        }
      </div>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(RenderGuard<CombinedProps>(UserDefinedText));
