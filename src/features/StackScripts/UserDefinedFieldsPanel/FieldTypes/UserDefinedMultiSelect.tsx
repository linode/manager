import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Typography from 'material-ui/Typography';
import FormControlLabel from 'material-ui/Form/FormControlLabel';

import Toggle from 'src/components/Toggle';

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
  manyof: string[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

class UserDefinedSelect extends React.Component<CombinedProps, State> {
  state: State = {
    manyof: this.props.field.manyof!.split(','),
  };

  handleSelectManyOf = (e: any) => {
    const { updateFormState, udf_data, field } = this.props;

    // when sending POST data to create a new linode, the 'manyof' prop needs to be taken
    // as a comma-seperate string, but for the time being we'll convert to an array to compare
    const selectedValuesToArray = udf_data[field.name] && udf_data[field.name].split(',') || [];

    let iterator = 0;
    let alreadySelected = false; // is the value we're toggling already turned on?

    while (iterator < selectedValuesToArray.length) {
      if (selectedValuesToArray[iterator] === e.target.value) {
        // it we toggled the selection, and it already exists in the
        // selected state, we'll remove it
        selectedValuesToArray.splice(iterator, 1); // remove value from array
        alreadySelected = true;
        break;
      }
      // otherwise, let's keep checking to see if we already toggled it on
      iterator = iterator + 1;
    }

    if (!alreadySelected) {
      selectedValuesToArray.push(e.target.value); // we toggled the value on
    }

    // convert back to comma seperated string to send with the POST request
    const newSelections = selectedValuesToArray.join(',');

    updateFormState([{
      stateKey: 'udf_data',
      newValue: { ...udf_data, [field.name]: newSelections },
    }]);

  }

  render() {
    const { manyof } = this.state;
    const { udf_data, field, classes } = this.props;

    // we are setting default values in the parent component, so we want to use these
    // default values to determine what will be checked upon initial render
    const selectedValuesToArray = udf_data[field.name] && udf_data[field.name].split(',') || [];

    return (
      <div className={classes.root}>
        <Typography variant="subheading" >
          {field.label}
        </Typography>
        {manyof.map((choice: string, index) => {
          return (
            <React.Fragment key={index}>
              <FormControlLabel
                className="toggleLabel"
                control={
                  <Toggle
                    value={choice}
                    checked={
                      selectedValuesToArray // do we have selected values?
                        ? selectedValuesToArray.some((selectedValue: string) =>
                          choice === selectedValue)
                        : false} // otherwise, nothing is checked
                    onChange={this.handleSelectManyOf}
                  />}
                label={choice}
              />
            </React.Fragment>
          );
        })}
      </div>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(UserDefinedSelect);

