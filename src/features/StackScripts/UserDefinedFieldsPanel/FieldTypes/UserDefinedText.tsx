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
  field: Linode.StackScript.UserDefinedField;
  updateFormState: (key: string, value: any) => void;
  udf_data: Linode.StackScript.UserDefinedField;
  isOptional: boolean;
  placeholder?: string;
  error?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class UserDefinedText extends React.Component<CombinedProps, {}> {
  renderTextField = () => {
    const { udf_data, error, field, placeholder, isOptional } = this.props;

    return (
      <React.Fragment>
        <TextField
          required={!isOptional}
          onChange={this.handleUpdateText}
          label={field.label}
          value={udf_data[field.name] || ''}
          errorText={error}
          // small={isOptional}
          helperText={placeholder}
        />
      </React.Fragment>
    );
  };

  renderPasswordField = () => {
    const {
      udf_data,
      error,
      field,
      placeholder,
      isOptional,
      classes
    } = this.props;

    return (
      <AccessPanel
        required={!isOptional}
        password={udf_data[field.name] || ''}
        handleChange={this.handleUpdatePassword}
        label={field.label}
        noPadding
        placeholder={placeholder}
        error={error}
        hideStrengthLabel
        className={!isOptional ? classes.accessPanel : ''}
        isOptional={isOptional}
        hideHelperText
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
