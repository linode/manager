import { UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import * as React from 'react';
import FormControlLabel from 'src/components/core/FormControlLabel';
import InputLabel from 'src/components/core/InputLabel';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import MenuItem from 'src/components/MenuItem';
import Notice from 'src/components/Notice';
import Radio from 'src/components/Radio';
import RenderGuard from 'src/components/RenderGuard';
import TextField from 'src/components/TextField';

type ClassNames = 'root' | 'radioGroupLabel';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      margin: `${theme.spacing(3)}px 0 0`,
    },
    radioGroupLabel: {
      display: 'block',
    },
  });

interface Props {
  updateFormState: (key: string, value: any) => void;
  value: string;
  field: UserDefinedField;
  isOptional: boolean;
  error?: string;
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
    const { updateFormState, field } = this.props;
    updateFormState(field.name, e.target.value);
  };

  render() {
    const { oneof } = this.state;
    const { value, error, field, classes, isOptional } = this.props;

    /* Display a select if there are more than 2 oneof options, otherwise display as radio. */
    if (oneof.length > 2) {
      return (
        <div>
          {error && <Notice error text={error} spacingTop={8} />}
          <TextField
            label={field.label}
            onChange={this.handleSelectOneOf}
            value={value}
            select
          >
            {oneof.map((choice: string, index) => {
              return (
                <MenuItem value={choice} key={index}>
                  {choice}
                </MenuItem>
              );
            })}
          </TextField>
        </div>
      );
    } else {
      return (
        <div className={classes.root}>
          {error && <Notice error text={error} spacingTop={8} />}
          <InputLabel className={classes.radioGroupLabel}>
            {field.label}
            {!isOptional && '*'}
          </InputLabel>

          {oneof.map((choice: string, index) => {
            return (
              <React.Fragment key={index}>
                <FormControlLabel
                  value={choice}
                  control={
                    <Radio
                      name={choice}
                      checked={!!value && value === choice}
                      /*
                      NOTE: Although the API returns a default value and we're auto selecting
                      a value for the user, it is not necessary to store this value
                      in the state because it's not necessary for the POST request, since
                      the backend will automatically POST with that default value
                    */
                      onChange={this.handleSelectOneOf}
                      data-qa-perm-none-radio
                    />
                  }
                  label={choice}
                />
              </React.Fragment>
            );
          })}
        </div>
      );
    }
  }
}

const styled = withStyles(styles);

export default styled(RenderGuard<CombinedProps>(UserDefinedSelect));
