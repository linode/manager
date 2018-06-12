import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Typography from 'material-ui/Typography';

import { assocPath } from 'ramda';

import TextField from 'src/components/TextField';

import { StateToUpdate as FormState } from '../../../linodes/LinodesCreate';


type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    margin: theme.spacing.unit * 3,
  },
});

interface Props {
  isPassword?: boolean;
  field: Linode.StackScript.UserDefinedField;
  updateFormState: (stateToUpdate: FormState[]) => void;
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
    return (
      <div>password field</div>
    );
  }

  handleUpdateText = (e: any) => {
    const { updateFormState, field, udf_data } = this.props;

    // either overwrite or create new selection
    const newUDFData = assocPath([field.name], e.target.value, udf_data);

    updateFormState([{
      stateKey: 'udf_data',
      newValue: { ...udf_data, ...newUDFData },
    }]);
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

export default styled(UserDefinedText);
