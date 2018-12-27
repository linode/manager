import * as React from 'react';
import { StackScriptPanelContentBase, StackScriptPanelContentBaseProps, StackScriptPanelContentBaseState, ChildrenProps, styled } from '../StackScriptPanelContentBase';
import SelectStackScriptsSection from './SelectStackScriptsSection';

interface Props {
  request: (username: string, params: Params, filter: any) =>
    Promise<Linode.ResourcePage<Linode.StackScript.Response>>;
  onSelect: (id: number, label: string, username: string, images: string[],
    userDefinedFields: Linode.StackScript.UserDefinedField[]) => void;
  currentUser: string;
  category: string;
  publicImages: Linode.Image[];
  resetStackScriptSelection: () => void;
}

type CurrentFilter = 'label' | 'deploys' | 'revision';

interface DialogVariantProps {
  open: boolean;
}
interface Dialog {
  makePublic: DialogVariantProps,
  delete: DialogVariantProps,
  stackScriptID: number | undefined;
  stackScriptLabel: string;
}

interface Params {
  page?: number;
  page_size?: number;
}

type APIFilters = 'label'
| 'deployments_active'
| 'updated'

interface FilterInfo {
  apiFilter: APIFilters | null;
  currentFilter: CurrentFilter | null;
}

type SortOrder = 'asc' | 'desc';

interface State {
  currentPage: number;
  selected?: number;
  loading?: boolean;
  gettingMoreStackScripts: boolean;
  allStackScriptsLoaded: boolean;
  getMoreStackScriptsFailed: boolean; // did our attempt to get the next page of stackscripts fail?
  listOfStackScripts: Linode.StackScript.Response[]; // @TODO type correctly
  sortOrder: SortOrder;
  currentFilterType: CurrentFilter | null;
  currentFilter: any; // @TODO type correctly
  currentSearchFilter: any;
  isSorting: boolean;
  error?: Error;
  fieldError: Linode.ApiFieldError | undefined;
  isSearching: boolean;
  didSearch: boolean;
  successMessage: string;
}

class SelectStackScriptPanelContent<StackScriptPanelContentBaseProps, State> extends StackScriptPanelContentBase {


  getDefaultState = () => ({
    ...super.getDefaultState(),
    selected: undefined,
  });

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
    this.setState({ selected: stackscript.id });
  }


  renderChildren(baseProps: ChildrenProps) {
    return <SelectStackScriptsSection
      selectedId={this.state.selected}
      onSelect={this.handleSelectStackScript}
      isSorting={baseProps.isSorting}
      data={this.state.listOfStackScripts}
      publicImages={baseProps.publicImages}
      currentUser={baseProps.currentUser}
    />
  }

}

export default styled(SelectStackScriptPanelContent);
