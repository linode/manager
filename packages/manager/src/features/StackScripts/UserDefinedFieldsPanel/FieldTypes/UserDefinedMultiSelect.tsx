import { UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import * as React from 'react';

import Select, { Item } from 'src/components/EnhancedSelect/Select';
import { Notice } from 'src/components/Notice/Notice';
import { RenderGuard } from 'src/components/RenderGuard';

interface Props {
  error?: string;
  field: UserDefinedField;
  isOptional: boolean;
  updateFormState: (key: string, value: any) => void;
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
  render() {
    const { manyof } = this.state;
    const { error, field, value: propValue } = this.props;

    /**
     * if we don't have any options selected for this multivalue
     * UDF, just pass undefined as the value, so the form is reset
     */
    const value = !!propValue
      ? propValue.split(',').map((eachValue) => ({
          label: eachValue,
          value: eachValue,
        }))
      : undefined;

    const manyOfOptions = manyof.map((choice: string) => {
      return {
        label: choice,
        value: choice,
      };
    });

    return (
      <div>
        {error && <Notice spacingTop={8} variant="error" text={error} />}
        <Select
          isMulti={true}
          label={field.label}
          onChange={this.handleSelectManyOf}
          options={manyOfOptions}
          value={value}
          // small={isOptional}
        />
      </div>
    );
  }

  handleSelectManyOf = (selectedOptions: Item[]) => {
    const { field, updateFormState } = this.props;

    const arrayToString = Array.prototype.map
      .call(selectedOptions, (opt: Item) => opt.value)
      .toString();

    updateFormState(field.name, arrayToString);
  };

  state: State = {
    manyof: this.props.field.manyof!.split(','),
  };
}

export default RenderGuard<CombinedProps>(UserDefinedMultiSelect);
