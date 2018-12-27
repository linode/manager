import * as React from 'react';
import { ChildrenProps, StackScriptPanelContentBase, StackScriptPanelContentBaseProps, StackScriptPanelContentBaseState, styled } from '../StackScriptPanelContentBase';
import SelectStackScriptsSection from './SelectStackScriptsSection';

interface Props {
  onSelect: (id: number, label: string, username: string, images: string[],
    userDefinedFields: Linode.StackScript.UserDefinedField[]) => void;
  resetStackScriptSelection: () => void;
}

type CombinedProps = StackScriptPanelContentBaseProps & Props;

interface State {
  selected?: number;
}

type CombinedState = StackScriptPanelContentBaseState & State;

class SelectStackScriptPanelContent extends StackScriptPanelContentBase<CombinedProps, CombinedState> {

  getDefaultState(): CombinedState {
    return {
      ...super.getDefaultState(),
      selected: undefined,
    };
  }

  isSelecting = true;

  state: StackScriptPanelContentBaseState = this.getDefaultState();

  mounted: boolean = false;

  handleSelectStackScript = (stackscript: Linode.StackScript.Response) => {
    this.props.onSelect(
      stackscript.id,
      stackscript.label,
      stackscript.username,
      stackscript.images,
      stackscript.user_defined_fields,
    );
    this.setState({ selected: stackscript.id } as CombinedState);
  }


  renderChildren(baseProps: ChildrenProps) {
    const state: CombinedState = this.state;

    return <SelectStackScriptsSection
      selectedId={state.selected}
      onSelect={this.handleSelectStackScript}
      isSorting={baseProps.isSorting}
      data={state.listOfStackScripts}
      publicImages={baseProps.publicImages}
      currentUser={baseProps.currentUser}
    />
  }

}

export default styled(SelectStackScriptPanelContent);
