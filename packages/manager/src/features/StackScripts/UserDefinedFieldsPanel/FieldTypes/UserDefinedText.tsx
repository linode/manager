import { UserDefinedField } from 'linode-js-sdk/lib/stackscripts';
import * as React from 'react';
import AccessPanel from 'src/components/AccessPanel';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import RenderGuard from 'src/components/RenderGuard';
import TextField from 'src/components/TextField';

type ClassNames = 'root' | 'accessPanel';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    accessPanel: {
      marginTop: 0
    }
  });

interface Props {
  isPassword?: boolean;
  field: UserDefinedField;
  updateFormState: (key: string, value: any) => void;
  isOptional: boolean;
  placeholder?: string;
  error?: string;
  value: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class UserDefinedText extends React.Component<CombinedProps, {}> {
  renderTextField = () => {
    const { error, field, placeholder, isOptional } = this.props;

    return (
      <React.Fragment>
        <TextField
          required={!isOptional}
          onChange={this.handleUpdateText}
          label={field.label}
          errorText={error}
          // small={isOptional}
          helperText={placeholder}
          value={this.props.value}
        />
      </React.Fragment>
    );
  };

  renderPasswordField = () => {
    const { error, field, placeholder, isOptional, classes } = this.props;

    return (
      <AccessPanel
        required={!isOptional}
        handleChange={this.handleUpdatePassword}
        label={field.label}
        noPadding
        placeholder={placeholder}
        error={error}
        hideStrengthLabel
        className={!isOptional ? classes.accessPanel : ''}
        isOptional={isOptional}
        hideHelperText
        password={this.props.value}
      />
    );
  };

  handleUpdateText = (e: any) => {
    const { updateFormState, field } = this.props;
    updateFormState(field.name, e.target.value);
  };

  handleUpdatePassword = (value: string) => {
    const { updateFormState, field } = this.props;
    updateFormState(field.name, value);
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        {this.props.isPassword
          ? this.renderPasswordField()
          : this.renderTextField()}
      </div>
    );
  }
}

const styled = withStyles(styles);

export default styled(RenderGuard<CombinedProps>(UserDefinedText));
