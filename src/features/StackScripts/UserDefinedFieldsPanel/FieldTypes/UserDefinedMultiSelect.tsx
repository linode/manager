import * as React from 'react';

import FormControlLabel from '@material-ui/core/FormControlLabel';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import Grid from 'src/components/Grid';
import RenderGuard from 'src/components/RenderGuard';
import Toggle from 'src/components/Toggle';

type ClassNames = 'root' | 'toggle';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    margin: `${theme.spacing.unit * 3}px 0`,
    paddingBottom: theme.spacing.unit * 3,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  toggle: {

  },
});

interface Props {
  updateFormState: (key: string, value: any) => void;
  udf_data: Linode.StackScript.UserDefinedField;
  field: Linode.StackScript.UserDefinedField;
  isOptional: boolean;
}

interface State {
  manyof: string[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

class UserDefinedMultiSelect extends React.Component<CombinedProps, State> {
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

    updateFormState(field.name, newSelections);

  }

  render() {
    const { manyof } = this.state;
    const { udf_data, field, classes, isOptional } = this.props;

    // we are setting default values in the parent component, so we want to use these
    // default values to determine what will be checked upon initial render
    const selectedValuesToArray = udf_data[field.name] && udf_data[field.name].split(',') || [];

    return (
      <div className={classes.root}>
        <Typography role="header" variant="subheading" >
          {field.label}
          {!isOptional &&
            ' *'
          }
        </Typography>
        <Grid container>
          {manyof.map((choice: string, index) => {
            return (
              <React.Fragment key={index}>
                <Grid item xs={12} md={6} lg={4}>
                  <FormControlLabel
                    className={classes.toggle}
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
                </Grid>
              </React.Fragment>
            );
          })}
        </Grid>
      </div>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(RenderGuard<CombinedProps>(UserDefinedMultiSelect));
