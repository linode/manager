import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import { compose, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';

import DebouncedSearch from 'src/components/DebouncedSearchTextField';
import Pagey, { PaginationProps } from 'src/components/Pagey';

import DeleteDialog from './Dialogs/DeleteDialog';
import MakePublicDialog from './Dialogs/MakePublicDialog';
import StackScriptTable from './Table/StackScriptTable';

import { deleteStackScript, updateStackScript } from 'src/services/stackscripts';
import {
  getCommunityStackscripts,
  getStackScriptsByUser
} from '../SelectStackScriptPanel/stackScriptUtils';

type ClassNames = 'root'
  | 'searchWrapper'
  | 'searchBar';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  searchWrapper: {
    position: 'sticky',
    width: '100%',
    top: 0,
    zIndex: 11,
    paddingBottom: theme.spacing.unit * 3,
    backgroundColor: theme.bg.white,
  },
  searchBar: {
    marginTop: 0,
    marginBottom: theme.spacing.unit,
    backgroundColor: theme.color.white,
  },
});

type AcceptedFilters = 'username' | 'description' | 'label'

interface Props {
  type: 'own' | 'linode' | 'community';
}

interface Dialogs {
  makePublicOpen: boolean;
  deleteOpen: boolean;
}

interface State {
  searchFilter?: any;
  dialogs: Dialogs,
  selectedStackScriptLabel: string;
  selectedStackScriptID?: number;
  dialogError?: string;
  dialogLoading: boolean;
}

type CombinedProps = Props
  & PaginationProps<Linode.StackScript.Response>
  & StateProps
  & WithStyles<ClassNames>;

class PanelContent extends React.Component<CombinedProps, State> {
  state: State = {
    searchFilter: undefined,
    dialogs: {
      makePublicOpen: false,
      deleteOpen: false,
    },
    selectedStackScriptLabel: '',
    selectedStackScriptID: undefined,
    dialogLoading: false,
  }

  componentDidMount() {
    this.props.request();
  }

  componentDidUpdate(prevProps: CombinedProps) {
    if (prevProps.type !== this.props.type) {
      /**
       * handle page change handles the request as well
       * so no need to run this.props.request()
       * Also set loading state back to true
       */
      this.props.handlePageChange(1, true);
    }
  }

  handleSearch = (searchTerm: string) => {
    const { handleSearch, type } = this.props;
    const searchTermToLower = searchTerm.toLowerCase();
    /**
     * if the search term looks something like
     * username:marty or label:nginx
     * we can be sure we're searching with a specific filter in mind
     */
    const isAdvancedSearch =
      (type !== 'linode' && type !== 'own')
      && (searchTermToLower.includes('username:')
        || searchTermToLower.includes('label:')
        || searchTermToLower.includes('description:'))

    if (isAdvancedSearch) {
      const indexOfColon = searchTermToLower.indexOf(':');
      // everything before the colon is what we want to filter by
      const filterKey = searchTermToLower.substr(0, indexOfColon);
      // everything after the colon is the term we want to search for
      const advancedSearchTerm = searchTermToLower.substr(indexOfColon + 1);
      handleSearch(generateSpecificFilter(filterKey as AcceptedFilters, advancedSearchTerm))
    } else {
      /**
       * Otherwise, just generate a catch-all filter for
       * username, description, and label
       */
      handleSearch(generateCatchAllFilter(searchTermToLower));
    }
  }

  closeDialogs = () => {
    this.setState({
      dialogs: {
        makePublicOpen: false,
        deleteOpen: false,
      },
    })
  }

  openDeleteDialog = (stackScriptID: number, stackScriptLabel: string) => {
    this.setState({
      selectedStackScriptID: stackScriptID,
      selectedStackScriptLabel: stackScriptLabel,
      dialogs: {
        deleteOpen: true,
        makePublicOpen: false,
      },
      dialogLoading: false,
      dialogError: undefined,
    })
  }

  openMakePublicDialog = (stackScriptID: number, stackScriptLabel: string) => {
    this.setState({
      selectedStackScriptID: stackScriptID,
      selectedStackScriptLabel: stackScriptLabel,
      dialogs: {
        deleteOpen: false,
        makePublicOpen: true,
      },
      dialogLoading: false,
      dialogError: undefined,
    })
  }

  deleteStackScript = () => {
    const { selectedStackScriptID } = this.state;

    this.setState({
      dialogLoading: true
    })

    if (!selectedStackScriptID) {
      this.setState({
        dialogError: 'There was a problem processing your request'
      });
      return;
    }

    deleteStackScript(selectedStackScriptID)
      .then(() => {
        this.closeDialogs();
        this.props.onDelete();
      })
      .catch(err => {
        this.setState({
          dialogLoading: false,
          dialogError: 'There was a problem processing your request'
        })
      })
  }

  makeStackScriptPublic = () => {
    const { selectedStackScriptID } = this.state;

    this.setState({
      dialogLoading: true
    })

    if (!selectedStackScriptID) {
      this.setState({
        dialogError: 'There was a problem processing your request'
      });
      return;
    }

    updateStackScript(selectedStackScriptID, { is_public: true })
      .then(() => {
        this.closeDialogs();
        this.props.request();
      })
      .catch(err => {
        this.setState({
          dialogLoading: false,
          dialogError: 'There was a problem processing your request'
        })
      })
  }

  render() {
    const {
      classes,
      type,
      page,
      pageSize,
      count,
      handlePageSizeChange,
      handlePageChange,
      handleOrderChange,
      data,
      loading,
      order,
      orderBy,
      searching,
      username,
      error
    } = this.props;

    const paginationProps = {
      page,
      pageSize,
      count,
      handlePageChange,
      handlePageSizeChange,
      handleOrderChange,
      data,
      loading,
      error,
      order,
      orderBy
    };

    const {
      dialogs: {
        makePublicOpen,
        deleteOpen
      },
      selectedStackScriptLabel,
      dialogError,
      dialogLoading
    } = this.state;

    return (
      <React.Fragment>
        <DebouncedSearch
          placeholderText='Search by Label, Username, or Description'
          onSearch={this.handleSearch}
          className={classes.searchBar}
          isSearching={searching}
        /** uncomment when we upgrade to MUI v3 */
        // toolTipText={`Hint: try searching for a specific item by prepending your
        // search term with "username:", "label:", or "description:"`}
        />
        {username &&
          <StackScriptTable
            currentUser={username}
            type={type}
            triggerDelete={this.openDeleteDialog}
            triggerMakePublic={this.openMakePublicDialog}
            {...paginationProps}
          />
        }
        <DeleteDialog
          isOpen={deleteOpen}
          handleClose={this.closeDialogs}
          triggerDeleteStackScript={this.deleteStackScript}
          stackScriptLabel={selectedStackScriptLabel}
          error={dialogError}
          loading={dialogLoading}
        />
        <MakePublicDialog
          isOpen={makePublicOpen}
          handleClose={this.closeDialogs}
          triggerMakePublic={this.makeStackScriptPublic}
          stackScriptLabel={selectedStackScriptLabel}
          error={dialogError}
          loading={dialogLoading}
        />
      </React.Fragment>
    );
  }
}

const generateSpecificFilter = (
  key: AcceptedFilters,
  searchTerm: string
) => {
  return {
    [key]: {
      ["+contains"]: searchTerm
    }
  }
}

const generateCatchAllFilter = (searchTerm: string) => {
  return {
    ["+or"]: [
      {
        "label": {
          ["+contains"]: searchTerm
        },
      },
      {
        "username": {
          ["+contains"]: searchTerm
        },
      },
      {
        "description": {
          ["+contains"]: searchTerm
        },
      },
    ],
  };
}

const whichRequest = (type: 'linode' | 'own' | 'community', username: string) => {
  if (type === 'linode') {
    return (params: any, filters: any) => getStackScriptsByUser('linode', params, filters)
  }

  if (type === 'own') {
    return (params: any, filters: any) => getStackScriptsByUser(username, params, filters)
  }

  else {
    return (params: any, filters: any) => getCommunityStackscripts(username, params, filters)
  }
}

const updatedRequest = (ownProps: CombinedProps, params: any, filters: any) =>
  whichRequest(ownProps.type, ownProps.username)(params, filters)
    .then(response => response);

const paginated = Pagey(updatedRequest);

const styled = withStyles(styles, { withTheme: true });

interface StateProps {
  username: string;
}

const mapStateToProps: MapStateToProps<StateProps, Props, ApplicationState> = (state) => ({
  username: pathOr('', ['data', 'username'], state.__resources.profile),
});

const connected = connect(mapStateToProps);

const enhanced = compose(
  connected,
  styled,
  paginated,
)

export default enhanced(PanelContent);
