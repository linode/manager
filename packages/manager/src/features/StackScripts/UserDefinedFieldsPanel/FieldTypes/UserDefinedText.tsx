import * as classnames from 'classnames';
import { UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import * as React from 'react';
import AccessPanel from 'src/components/AccessPanel';
import {
  createStyles,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import RenderGuard from 'src/components/RenderGuard';
import TextField from 'src/components/TextField';

type ClassNames = 'accessPanel' | 'marginTop';

const styles = () =>
  createStyles({
    accessPanel: {
      padding: 0,
    },
    marginTop: {
      marginTop: 0,
    },
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
      <TextField
        required={!isOptional}
        onChange={this.handleUpdateText}
        label={field.label}
        errorText={error}
        helperText={placeholder}
        value={this.props.value}
      />
    );
  };

  renderPasswordField = () => {
    const { error, field, placeholder, isOptional, classes } = this.props;

    return (
      <AccessPanel
        required={!isOptional}
        handleChange={this.handleUpdatePassword}
        label={field.label}
        placeholder={placeholder}
        error={error}
        hideStrengthLabel
        className={classnames({
          [classes.accessPanel]: true,
          [classes.marginTop]: !isOptional,
        })}
        isOptional={isOptional}
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
    return (
      <div>
        {this.props.isPassword
          ? this.renderPasswordField()
          : this.renderTextField()}
      </div>
    );
  }
}

const styled = withStyles(styles);

export default styled(RenderGuard<CombinedProps>(UserDefinedText));
