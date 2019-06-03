import { WithStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import Notice from 'src/components/Notice';
import RenderGuard from 'src/components/RenderGuard';

type ClassNames = 'root';

const styles = (theme: Theme) =>
  createStyles({
    root: {}
  });

interface Props {
  updateFormState: (key: string, value: any) => void;
  udf_data: Linode.StackScript.UserDefinedField;
  field: Linode.StackScript.UserDefinedField;
  isOptional: boolean;
  error?: string;
}

interface State {
  manyof: string[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

class UserDefinedMultiSelect extends React.Component<CombinedProps, State> {
  state: State = {
    manyof: this.props.field.manyof!.split(',')
  };

  handleSelectManyOf = (selectedOptions: Item) => {
    const { updateFormState, field } = this.props;

    const arrayToString = Array.prototype.map
      .call(selectedOptions, (opt: Item) => opt.value)
      .toString();

    updateFormState(field.name, arrayToString);
  };

  render() {
    const { manyof } = this.state;
    const { error, field, classes, isOptional } = this.props;

    const manyOfOptions = manyof.map((choice: string) => {
      return {
        label: choice,
        value: choice
      };
    });

    return (
      <div className={classes.root}>
        {error && <Notice error text={error} spacingTop={8} />}
        <Select
          label={field.label}
          {...!isOptional && '*'}
          isMulti={true}
          onChange={this.handleSelectManyOf}
          options={manyOfOptions}
          // small={isOptional}
        />
      </div>
    );
  }
}

const styled = withStyles(styles);

export default styled(RenderGuard<CombinedProps>(UserDefinedMultiSelect));
