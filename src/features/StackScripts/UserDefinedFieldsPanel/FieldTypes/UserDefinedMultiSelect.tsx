import * as React from 'react';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import Notice from 'src/components/Notice';
import RenderGuard from 'src/components/RenderGuard';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
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
  selectedOptions: Item | Item[] | null;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class UserDefinedMultiSelect extends React.Component<CombinedProps, State> {
  state: State = {
    manyof: this.props.field.manyof!.split(','),
    selectedOptions: null
  };

  handleSelectManyOf = (selectedOptions: Item) => {
    this.setState({ selectedOptions });
    const { updateFormState, udf_data, field } = this.props;

    const arrayToString = Array.prototype.map
      .call(selectedOptions, (opt: Item) => opt.value)
      .toString();

    console.log(udf_data);
    console.log(arrayToString);

    updateFormState(field.name, arrayToString);
  };

  render() {
    const { manyof, selectedOptions } = this.state;
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
          value={selectedOptions}
          // small={isOptional}
        />
      </div>
    );
  }
}

const styled = withStyles(styles);

export default styled(RenderGuard<CombinedProps>(UserDefinedMultiSelect));
