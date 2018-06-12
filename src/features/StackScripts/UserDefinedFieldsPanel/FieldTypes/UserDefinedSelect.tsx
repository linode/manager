import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Typography from 'material-ui/Typography';

import { assocPath } from 'ramda';

import Radio from 'src/components/Radio';

import { StateToUpdate as FormState } from '../../../linodes/LinodesCreate';


type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    margin: theme.spacing.unit * 3,
  },
});

interface Props {
  updateFormState: (stateToUpdate: FormState[]) => void;
  udf_data: any; // udf_data we've already selected
  field: Linode.StackScript.UserDefinedField;
}

interface State {
  oneof: string[];
  selectedOption: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class UserDefinedSelect extends React.Component<CombinedProps, State> {
  state: State = {
    oneof: this.props.field.oneof!.split(','),
    selectedOption: '',
  };

  handleSelectOneOf = (e: any) => {
    const { updateFormState, udf_data, field } = this.props;

    // either overwrite or create new selection
    const newUDFData = assocPath([field.name], e.target.value, udf_data);

    updateFormState([{
      stateKey: 'udf_data',
      newValue: { ...udf_data, ...newUDFData },
    }]);

  }

  render() {
    const { oneof } = this.state;
    const { udf_data, field, classes } = this.props;

    return (
      <div className={classes.root}>
        <Typography variant="subheading" >
          {field.label}
        </Typography>
        {oneof.map((choice: string, index) => {
          return (
            <React.Fragment key={index}>
              <Radio
                name={choice}
                checked=
                {(!!udf_data[field.name]
                  && udf_data[field.name] === choice)}
                /*
                NOTE: Although the API returns a default value and we're auto selecting
                a value for the user, it is not necessary to store this value
                in the state because it's not necessary for the POST request, since
                the backend will automatically POST with that default value
              */
                value={choice}
                onChange={this.handleSelectOneOf}
                data-qa-perm-none-radio
              />
              {choice}
            </React.Fragment>
          );
        })}
      </div>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(UserDefinedSelect);
