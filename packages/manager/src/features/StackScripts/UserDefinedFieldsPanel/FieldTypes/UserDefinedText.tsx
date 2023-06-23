import classNames from 'classnames';
import { UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import * as React from 'react';
import AccessPanel from 'src/components/AccessPanel/AccessPanel';
import { createStyles, withStyles, WithStyles } from '@mui/styles';
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
  tooltip?: JSX.Element;
  tooltipInteractive?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class UserDefinedText extends React.Component<CombinedProps, {}> {
  renderTextField = () => {
    const { error, field, isOptional, placeholder } = this.props;

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
    const {
      classes,
      error,
      field,
      isOptional,
      placeholder,
      tooltip,
      tooltipInteractive,
    } = this.props;

    return (
      <AccessPanel
        required={!isOptional}
        handleChange={this.handleUpdatePassword}
        label={field.label}
        placeholder={placeholder}
        error={error}
        hideStrengthLabel
        className={classNames({
          [classes.accessPanel]: true,
          [classes.marginTop]: !isOptional,
        })}
        isOptional={isOptional}
        password={this.props.value}
        disabledReason={tooltip}
        tooltipInteractive={tooltipInteractive}
      />
    );
  };

  handleUpdateText = (e: any) => {
    const { field, updateFormState } = this.props;
    updateFormState(field.name, e.target.value);
  };

  handleUpdatePassword = (value: string) => {
    const { field, updateFormState } = this.props;
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
