import { Notice } from '@linode/ui';
import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { RenderGuard } from 'src/components/RenderGuard';

import type { UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import type { Item } from 'src/components/EnhancedSelect';

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

class UserDefinedMultiSelect extends React.Component<Props, State> {
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
        {error && <Notice spacingTop={8} text={error} variant="error" />}

        <Autocomplete
          onChange={(_, selected) => {
            if (selected) {
              this.handleSelectManyOf(selected);
            }
          }}
          label={field.label}
          multiple
          options={manyOfOptions ?? []}
          value={value}
        />
      </div>
    );
  }
}

export default RenderGuard<Props>(UserDefinedMultiSelect);
