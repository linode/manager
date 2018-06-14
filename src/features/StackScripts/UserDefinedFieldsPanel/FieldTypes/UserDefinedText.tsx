import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Typography from 'material-ui/Typography';

import TextField from 'src/components/TextField';
import RenderGuard from 'src/components/RenderGuard';
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
}

interface State { }

type CombinedProps = Props & WithStyles<ClassNames>;

class UserDefinedText extends React.Component<CombinedProps, State> {
  state: State = {};

  renderTextField = () => {
    const { udf_data, field } = this.props;

    return (
      <React.Fragment>
        <Typography variant="subheading" >
          {field.label}
        </Typography>
        <TextField
          onChange={this.handleUpdateText}
          label={field.label}
          value={udf_data[field.name] || ''}
        />
      </React.Fragment>
    );
  }

  renderPasswordField = () => {
    const { udf_data, field } = this.props;

    return (
      <PasswordPanel
        password={udf_data[field.name] || ''}
        handleChange={this.handleUpdatePassword}
        label={field.label}
        noPadding
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
