import { UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import { WithStyles, createStyles, withStyles } from '@mui/styles';
import classNames from 'classnames';
import * as React from 'react';

import AccessPanel from 'src/components/AccessPanel/AccessPanel';
import { RenderGuard } from 'src/components/RenderGuard';
import { TextField } from 'src/components/TextField';

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
  error?: string;
  field: UserDefinedField;
  isOptional: boolean;
  isPassword?: boolean;
  placeholder?: string;
  tooltip?: JSX.Element;
  tooltipInteractive?: boolean;
  updateFormState: (key: string, value: any) => void;
  value: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class UserDefinedText extends React.Component<CombinedProps, {}> {
  render() {
    return (
      <div>
        {this.props.isPassword
          ? this.renderPasswordField()
          : this.renderTextField()}
      </div>
    );
  }

  handleUpdatePassword = (value: string) => {
    const { field, updateFormState } = this.props;
    updateFormState(field.name, value);
  };

  handleUpdateText = (e: any) => {
    const { field, updateFormState } = this.props;
    updateFormState(field.name, e.target.value);
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
        className={classNames({
          [classes.accessPanel]: true,
          [classes.marginTop]: !isOptional,
        })}
        disabledReason={tooltip}
        error={error}
        handleChange={this.handleUpdatePassword}
        hideStrengthLabel
        isOptional={isOptional}
        label={field.label}
        password={this.props.value}
        placeholder={placeholder}
        required={!isOptional}
        tooltipInteractive={tooltipInteractive}
      />
    );
  };

  renderTextField = () => {
    const { error, field, isOptional, placeholder } = this.props;

    return (
      <TextField
        errorText={error}
        helperText={placeholder}
        label={field.label}
        onChange={this.handleUpdateText}
        required={!isOptional}
        value={this.props.value}
      />
    );
  };
}

const styled = withStyles(styles);

export default styled(RenderGuard<CombinedProps>(UserDefinedText));
