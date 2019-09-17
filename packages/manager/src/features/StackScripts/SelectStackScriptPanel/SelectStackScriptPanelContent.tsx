import { Grant } from 'linode-js-sdk/lib/account';
import { Image } from 'linode-js-sdk/lib/images';
import { ResourcePage } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import { compose } from 'recompose';
import StackScriptBase, {
  StateProps
} from '../StackScriptBase/StackScriptBase';
import SelectStackScriptsSection from './SelectStackScriptsSection';

interface Props {
  onSelect: (
    id: number,
    label: string,
    username: string,
    images: string[],
    userDefinedFields: Linode.StackScript.UserDefinedField[]
  ) => void;
  resetStackScriptSelection: () => void;
  publicImages: Record<string, Image>;
  currentUser: string;
  request: (
    username: string,
    params?: any,
    filter?: any,
    stackScriptGrants?: Grant[]
  ) => Promise<ResourcePage<Linode.StackScript.Response>>;
  category: string;
  disabled?: boolean;
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
    selected: undefined
  };

  handleSelectStackScript = (stackscript: Linode.StackScript.Response) => {
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

export default compose<CombinedProps, Props>(StackScriptBase(true))(
  SelectStackScriptPanelContent
);
