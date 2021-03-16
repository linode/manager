import { Image } from '@linode/api-v4/lib/images';
import { StackScript, UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import * as React from 'react';
import { compose } from 'recompose';
import StackScriptBase, {
  StateProps,
} from '../StackScriptBase/StackScriptBase';
import { StackScriptsRequest } from '../types';
import SelectStackScriptsSection from './SelectStackScriptsSection';

interface Props {
  onSelect: (
    id: number,
    label: string,
    username: string,
    images: string[],
    userDefinedFields: UserDefinedField[]
  ) => void;
  resetStackScriptSelection: () => void;
  publicImages: Record<string, Image>;
  currentUser: string;
  request: StackScriptsRequest;
  category: string;
  disabled?: boolean;
  isOnCreate?: boolean;
}

type CombinedProps = StateProps & Props;

interface State {
  selected?: number;
}

class SelectStackScriptPanelContent extends React.Component<
  CombinedProps,
  State
> {
  state: State = {
    selected: undefined,
  };

  handleSelectStackScript = (stackscript: StackScript) => {
    if (this.props.disabled) {
      return;
    }
    this.props.onSelect(
      stackscript.id,
      stackscript.label,
      stackscript.username,
      stackscript.images,
      stackscript.user_defined_fields
    );
    this.setState({ selected: stackscript.id });
  };

  render() {
    const { selected } = this.state;
    const { listOfStackScripts } = this.props;

    return (
      <SelectStackScriptsSection
        selectedId={selected}
        onSelect={this.handleSelectStackScript}
        isSorting={this.props.isSorting}
        data={listOfStackScripts}
        publicImages={this.props.publicImages}
        currentUser={this.props.currentUser}
        disabled={this.props.disabled}
      />
    );
  }
}

export default compose<CombinedProps, Props>(
  StackScriptBase({ isSelecting: true })
)(SelectStackScriptPanelContent);
