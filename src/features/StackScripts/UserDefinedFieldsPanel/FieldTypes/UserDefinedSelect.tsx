import * as React from 'react';
import FormControlLabel from 'src/components/core/FormControlLabel';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import Radio from 'src/components/Radio';
import RenderGuard from 'src/components/RenderGuard';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    margin: `${theme.spacing.unit * 3}px 0 0`
  }
});

interface Props {
  updateFormState: (key: string, value: any) => void;
  udf_data: Linode.StackScript.UserDefinedField;
  field: Linode.StackScript.UserDefinedField;
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
    selectedOption: ''
  };

  handleSelectOneOf = (e: any) => {
    const { updateFormState, field } = this.props;
    updateFormState(field.name, e.target.value);
  };

  render() {
    const { oneof } = this.state;
    const { udf_data, error, field, classes, isOptional } = this.props;

    return (
      <div className={classes.root}>
        <Typography role="header" variant="h3">
          {field.label}
          {!isOptional && ' *'}
        </Typography>
        {error && <Notice error text={error} spacingTop={8} />}
        {oneof.map((choice: string, index) => {
          return (
            <React.Fragment key={index}>
              <FormControlLabel
                value={choice}
                control={
                  <Radio
                    name={choice}
                    checked={
                      !!udf_data[field.name] && udf_data[field.name] === choice
                    }
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

const styled = withStyles(styles);

export default styled(RenderGuard<CombinedProps>(UserDefinedSelect));
