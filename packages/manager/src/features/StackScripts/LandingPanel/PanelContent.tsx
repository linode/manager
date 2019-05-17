import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from '@material-ui/core/styles';
import { compose, pathOr, split } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import DebouncedSearch from 'src/components/DebouncedSearchTextField';
import Pagey, { PaginationProps } from 'src/components/Pagey';
import {
  deleteStackScript,
  updateStackScript
} from 'src/services/stackscripts';
import { MapState } from 'src/store/types';
import { sendStackscriptsSearchEvent } from 'src/utilities/ga';
import {
  getCommunityStackscripts,
  getStackScriptsByUser
} from '../stackScriptUtils';
import DeleteDialog from './Dialogs/DeleteDialog';
import MakePublicDialog from './Dialogs/MakePublicDialog';
import StackScriptTable from './Table/StackScriptTable';

type ClassNames = 'root' | 'searchWrapper' | 'searchBar';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  searchWrapper: {
    marginBottom: theme.spacing.unit * 3
  },
  searchBar: {
    marginTop: 0,
    backgroundColor: theme.color.white
  }
});

type AcceptedFilters = 'username' | 'description' | 'label';

interface Props {
  type: 'own' | 'linode' | 'community';
}

interface Dialogs {
  makePublicOpen: boolean;
  deleteOpen: boolean;
}

interface State {
  searchFilter?: any;
  dialogs: Dialogs;
  selectedStackScriptLabel: string;
  selectedStackScriptID?: number;
  dialogError?: string;
  dialogLoading: boolean;
}

type CombinedProps = Props &
  PaginationProps<Linode.StackScript.Response> &
  StateProps &
  WithStyles<ClassNames>;

class PanelContent extends React.Component<CombinedProps, State> {
  state: State = {
    searchFilter: undefined,
    dialogs: {
      makePublicOpen: false,
      deleteOpen: false
    },
    selectedStackScriptLabel: '',
    selectedStackScriptID: undefined,
    dialogLoading: false
  };

  componentDidMount() {
    this.props.request();
  }

  generateFilterAndTriggerSearch = (searchTerm: string) => {
    const { handleSearch, type } = this.props;
    const searchTermToLower = searchTerm.toLowerCase();
    /**
     * if the search term looks something like
     * username:marty or label:nginx
     * we can be sure we're searching with a specific filter in mind
     */
    const isAdvancedSearch =
      type !== 'linode' &&
      type !== 'own' &&
      (searchTermToLower.includes('username:') ||
        searchTermToLower.includes('label:') ||
        searchTermToLower.includes('description:'));

    if (isAdvancedSearch) {
      /** everything before the colon is the key and after the colon is the search term */
      const [filterKey, advancedSearchTerm] = split(':', searchTermToLower);
      handleSearch(
        generateSpecificFilter(filterKey as AcceptedFilters, advancedSearchTerm)
      );
    } else {
      /**
       * Otherwise, just generate a catch-all filter for
       * username, description, and label
       */
      handleSearch(generateCatchAllFilter(searchTermToLower));
    }
    sendStackscriptsSearchEvent(searchTermToLower);
  };

  closeDialogs = () => {
    this.setState({
      dialogs: {
        makePublicOpen: false,
        deleteOpen: false
      }
    });
  };

  openDeleteDialog = (stackScriptID: number, stackScriptLabel: string) => {
    this.setState({
      selectedStackScriptID: stackScriptID,
      selectedStackScriptLabel: stackScriptLabel,
      dialogs: {
        deleteOpen: true,
        makePublicOpen: false
      },
      dialogLoading: false,
      dialogError: undefined
    });
  };

  openMakePublicDialog = (stackScriptID: number, stackScriptLabel: string) => {
    this.setState({
      selectedStackScriptID: stackScriptID,
      selectedStackScriptLabel: stackScriptLabel,
      dialogs: {
        deleteOpen: false,
        makePublicOpen: true
      },
      dialogLoading: false,
      dialogError: undefined
    });
  };

  deleteStackScript = () => {
    const { selectedStackScriptID } = this.state;

    this.setState({
      dialogLoading: true
    });

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
        });
      });
  };

  makeStackScriptPublic = () => {
    const { selectedStackScriptID } = this.state;

    this.setState({
      dialogLoading: true
    });

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
        });
      });
  };

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
      dialogs: { makePublicOpen, deleteOpen },
      selectedStackScriptLabel,
      dialogError,
      dialogLoading
    } = this.state;

    return (
      <React.Fragment>
        <div className={classes.searchWrapper}>
          <DebouncedSearch
            placeholderText="Search by Label, Username, or Description"
            onSearch={this.generateFilterAndTriggerSearch}
            className={classes.searchBar}
            isSearching={searching}
            toolTipText={
              type === 'community'
                ? `Hint: try searching for a specific item by prepending your
            search term with "username:", "label:", or "description:"`
                : ''
            }
          />
        </div>
        {username && (
          <StackScriptTable
            currentUser={username}
            type={type}
            triggerDelete={this.openDeleteDialog}
            triggerMakePublic={this.openMakePublicDialog}
            {...paginationProps}
          />
        )}
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

const generateSpecificFilter = (key: AcceptedFilters, searchTerm: string) => {
  return {
    [key]: {
      ['+contains']: searchTerm
    }
  };
};

const generateCatchAllFilter = (searchTerm: string) => {
  return {
    ['+or']: [
      {
        label: {
          ['+contains']: searchTerm
        }
      },
      {
        username: {
          ['+contains']: searchTerm
        }
      },
      {
        description: {
          ['+contains']: searchTerm
        }
      }
    ]
  };
};

const whichRequest = (
  type: 'linode' | 'own' | 'community',
  username: string
) => {
  if (type === 'linode') {
    return (params: any, filters: any) =>
      getStackScriptsByUser('linode', params, filters);
  }

  if (type === 'own') {
    return (params: any, filters: any) =>
      getStackScriptsByUser(username, params, filters);
  } else {
    return (params: any, filters: any) =>
      getCommunityStackscripts(username, params, filters);
  }
};

const updatedRequest = (ownProps: CombinedProps, params: any, filters: any) =>
  whichRequest(ownProps.type, ownProps.username)(params, filters).then(
    response => response
  );

const paginated = Pagey(updatedRequest);

const styled = withStyles(styles);

interface StateProps {
  username: string;
}

const mapStateToProps: MapState<StateProps, Props> = state => ({
  username: pathOr('', ['data', 'username'], state.__resources.profile)
});

const connected = connect(mapStateToProps);

const enhanced = compose(
  connected,
  styled,
  paginated
);

export default enhanced(PanelContent);
