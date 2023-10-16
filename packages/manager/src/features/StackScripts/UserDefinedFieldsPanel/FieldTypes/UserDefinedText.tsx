import { UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { AccessPanel } from 'src/components/AccessPanel/AccessPanel';
import { RenderGuard } from 'src/components/RenderGuard';
import { TextField } from 'src/components/TextField';
import { omittedProps } from 'src/utilities/omittedProps';

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

class UserDefinedText extends React.Component<Props, {}> {
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
      error,
      field,
      isOptional,
      placeholder,
      tooltip,
      tooltipInteractive,
    } = this.props;

    return (
      <StyledAccessPanel
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

type StyledAccessPanelProps = Pick<Props, 'isOptional'>;

const StyledAccessPanel = styled(AccessPanel, {
  label: 'StyledAccessPanel',
  shouldForwardProp: omittedProps(['isOptional']),
})<StyledAccessPanelProps>(({ isOptional }) => ({
  padding: 0,
  ...(!isOptional && { margin: 0 }),
}));

export default RenderGuard<Props>(UserDefinedText);
