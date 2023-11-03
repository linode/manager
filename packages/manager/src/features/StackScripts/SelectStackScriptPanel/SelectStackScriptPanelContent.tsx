import { Image } from '@linode/api-v4/lib/images';
import { StackScript, UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import * as React from 'react';
import { compose } from 'recompose';

import StackScriptBase, {
  StateProps,
} from '../StackScriptBase/StackScriptBase';
import { StackScriptsRequest } from '../types';
import { SelectStackScriptsSection } from './SelectStackScriptsSection';

interface Props {
  category: string;
  currentUser: string;
  disabled?: boolean;
  isOnCreate?: boolean;
  onSelect: (
    id: number,
    label: string,
    username: string,
    images: string[],
    userDefinedFields: UserDefinedField[]
  ) => void;
  publicImages: Record<string, Image>;
  request: StackScriptsRequest;
  resetStackScriptSelection: () => void;
}

type CombinedProps = StateProps & Props;

interface State {
  selected?: number;
}

class SelectStackScriptPanelContent extends React.Component<
  CombinedProps,
  State
> {
  render() {
    const { selected } = this.state;
    const { listOfStackScripts } = this.props;

    return (
      <SelectStackScriptsSection
        currentUser={this.props.currentUser}
        data={listOfStackScripts}
        disabled={this.props.disabled}
        isSorting={this.props.isSorting}
        onSelect={this.handleSelectStackScript}
        publicImages={this.props.publicImages}
        selectedId={selected}
      />
    );
  }

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

  state: State = {
    selected: undefined,
  };
}

export default compose<CombinedProps, Props>(
  StackScriptBase({ isSelecting: true })
)(SelectStackScriptPanelContent);
