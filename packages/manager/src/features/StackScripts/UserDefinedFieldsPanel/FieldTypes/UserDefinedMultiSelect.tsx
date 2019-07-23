import * as React from 'react';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import Notice from 'src/components/Notice';
import RenderGuard from 'src/components/RenderGuard';

interface Props {
  updateFormState: (key: string, value: any) => void;
  field: Linode.StackScript.UserDefinedField;
  isOptional: boolean;
  error?: string;
  /**
   * value will end up being a comma-seperated list
   * something like TCP,TCPIP,Helloworld
   *
   * reason for this is because that's the format the API
   * accepts
   */
  value: string;
}

interface State {
  manyof: string[];
}

type CombinedProps = Props;

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
    const { error, field, isOptional, value: propValue } = this.props;

    /**
     * if we don't have any options selected for this multivalue
     * UDF, just pass undefined as the value, so the form is reset
     */
    const value = !!propValue
      ? propValue.split(',').map(eachValue => ({
          label: eachValue,
          value: eachValue
        }))
      : undefined;

    const manyOfOptions = manyof.map((choice: string) => {
      return {
        label: choice,
        value: choice
      };
    });

    return (
      <div>
        {error && <Notice error text={error} spacingTop={8} />}
        <Select
          label={field.label}
          {...!isOptional && '*'}
          value={value}
          isMulti={true}
          onChange={this.handleSelectManyOf}
          options={manyOfOptions}
          // small={isOptional}
        />
      </div>
    );
  }
}

export default RenderGuard<CombinedProps>(UserDefinedMultiSelect);
