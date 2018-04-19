import * as React from 'react';
import * as moment from 'moment';
import Axios from 'axios';
import Downshift, { DownshiftState, StateChangeOptions } from 'downshift';
import { connect } from 'react-redux';
import { pathOr } from 'ramda';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import {
  withStyles,
  WithStyles,
  Theme,
  StyleRules,
} from 'material-ui/styles';
import Paper from 'material-ui/Paper';
import { MenuItem } from 'material-ui/Menu';
import IconButton from 'material-ui/IconButton';
import Close from 'material-ui-icons/Close';
import Search from 'material-ui-icons/Search';

import LinodeIcon from 'src/assets/addnewmenu/linode.svg';
import VolumeIcon from 'src/assets/addnewmenu/volume.svg';
import NodebalIcon from 'src/assets/addnewmenu/nodebalancer.svg';
import { API_ROOT } from 'src/constants';
import LinodeTheme from 'src/theme';
import TextField from 'src/components/TextField';
import { labelFromType } from 'src/features/linodes/presentation';

import SearchSuggestion, { SearchSuggestionT } from './SearchSuggestion';

type Styles =
  'root'
  | 'navIconHide'
  | 'close'
  | 'textfieldContainer'
  | 'textfield'
  | 'input'
  | 'icon'
  | 'searchSuggestions'
  | 'item'
  | 'selectedMenuItem';

const styles = (theme: Theme & Linode.Theme): StyleRules => ({
  root: {
    position: 'relative', /* for search results */
    height: 50,
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    backgroundColor: LinodeTheme.bg.main,
    padding: theme.spacing.unit,
    marginLeft: theme.spacing.unit * 2,
    marginRight: theme.spacing.unit * 2,
    transition: theme.transitions.create(['opacity']),
    [theme.breakpoints.down('sm')]: {
      backgroundColor: 'white',
      position: 'absolute',
      width: 'calc(100% - 118px)',
      zIndex: '2',
      left: 0,
      visibility: 'hidden',
      opacity: 0,
      margin: 0,
      '&.active': {
        visibility: 'visible',
        opacity: 1,
      },
    },
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
  navIconHide: {
    '& > span': {
      justifyContent: 'flex-end',
    },
    '& svg': {
      width: 32,
      height: 32,
    },
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  close: {
    '& > span': {
      padding: 2,
    },
    '&:hover, &:focus': {
      color: 'white',
      backgroundColor: theme.palette.primary.main,
    },
  },
  icon: {
    color: '#c9cacb',
    fontSize: '2rem',
  },
  textfieldContainer: {
    width: '100%',
    [theme.breakpoints.down('sm')]: {},
  },
  textfield: {
    margin: 0,
    flex: 1,
    minHeight: 'initial',
  },
  input: {
    maxWidth: '100%',
    border: 0,
    background: 'transparent',
    '& input': {
      transition: theme.transitions.create(['opacity']),
      fontSize: '1.0em',
      [theme.breakpoints.down('sm')]: {},
    },
  },
  searchSuggestions: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 60,
    padding: 0,
    boxShadow: '0 0 5px #ddd',
  },
  item: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:last-item': {
      border: 0,
    },
  },
  selectedMenuItem: {
    backgroundColor: '#fafafa !important',
    '& .circle': {
      transition: theme.transitions.create(['fill']),
      fill: theme.palette.primary.main,
    },
    '& .outerCircle': {
      transition: theme.transitions.create(['stroke']),
      stroke: '#2967B1',
    },
    '& .insidePath *': {
      transition: theme.transitions.create(['stroke']),
      stroke: 'white',
    },
  },
});


interface Props {
  types: Linode.LinodeType[];
}

interface State {
  searchText: string;
  lastFetch: moment.Moment;
  linodes?: Linode.Linode[];
  volumes?: Linode.Volume[];
  nodebalancers?: Linode.NodeBalancer[];
  domains?: Linode.Domain[];
  images?: Linode.Image[];
  searchActive: boolean;
}

type FinalProps = Props & WithStyles<Styles> & RouteComponentProps<{}>;

class SearchBar extends React.Component<FinalProps, State> {
  state: State = {
    searchText: '',
    lastFetch: moment.utc(),
    searchActive: false,
  };

  dataAvailable() {
    return (
      this.state.linodes
      || this.state.volumes
      || this.state.nodebalancers
      || this.state.domains
    );
  }

  linodeDescription(typeId: string, imageId: string) {
    const { types } = this.props;
    const { images } = this.state;
    const image = (images && images.find(image => image.id === imageId))
      || { label: 'Unknown Image' };
    const imageDesc = image.label;
    const typeDesc = labelFromType(types.find(type => type.id === typeId) as Linode.LinodeType);
    return `${imageDesc}, ${typeDesc}`;
  }

  updateData() {
    /* TODO: Use service modules for these API calls */
    /* TODO: Fetch every page */
    Axios.get(`${API_ROOT}/linode/instances/`)
      .then((response) => {
        this.setState({ linodes: response.data.data });
      });

    Axios.get(`${API_ROOT}/volumes`)
      .then((response) => {
        this.setState({ volumes: response.data.data });
      });

    Axios.get(`${API_ROOT}/nodebalancers`)
      .then((response) => {
        this.setState({ nodebalancers: response.data.data });
      });

    Axios.get(`${API_ROOT}/domains`)
      .then((response) => {
        this.setState({ domains: response.data.data });
      });

    Axios.get(`${API_ROOT}/images`)
      .then((response) => {
        this.setState({ images: response.data.data });
      });
  }

  getSearchSuggestions(query: string | null) {
    if (!this.dataAvailable || !query) return [];

    const searchResults = [];

    if (this.state.linodes) {
      const linodesByLabel = this.state.linodes.filter(
        linode => linode.label.toLowerCase().includes(query.toLowerCase()),
      );
      searchResults.push(...(linodesByLabel.map(linode => ({
        title: linode.label,
        description: this.linodeDescription(linode.type, linode.image),
        Icon: LinodeIcon,
        path: `/linodes/${linode.id}`,
      }))));
    }

    if (this.state.volumes) {
      const volumesByLabel = this.state.volumes.filter(
        volume => volume.label.toLowerCase().includes(query.toLowerCase()),
      );
      searchResults.push(...(volumesByLabel.map(volume => ({
        title: volume.label,
        description: volume.size + ' G',
        Icon: VolumeIcon,
        path: `/volumes/${volume.id}`,
      }))));
    }

    if (this.state.nodebalancers) {
      const nodebalancersByLabel = this.state.nodebalancers.filter(
        nodebal => nodebal.label.toLowerCase().includes(query.toLowerCase()),
      );
      searchResults.push(...(nodebalancersByLabel.map(nodebal => ({
        title: nodebal.label,
        description: nodebal.hostname,
        Icon: NodebalIcon,
        path: `/nodebalancers/${nodebal.id}`,
      }))));
    }

    if (this.state.domains) {
      const domainsByLabel = this.state.domains.filter(
        domain => domain.domain.toLowerCase().includes(query.toLowerCase()),
      );
      searchResults.push(...(domainsByLabel.map(domain => ({
        title: domain.domain,
        description: domain.description || domain.status,
        /* TODO: Update this with the Domains icon! */
        Icon: NodebalIcon,
        path: `/domains/${domain.id}`,
      }))));
    }

    return searchResults;
  }

  handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({
      searchText: e.target.value,
    }, () => {
      if (!this.dataAvailable() || moment.utc().diff(this.state.lastFetch) > 30000) {
        this.setState({ lastFetch: moment.utc() }, () => {
          this.updateData();
        });
      }
    });
  }

  toggleSearch = () => {
    this.setState({
      searchActive: !this.state.searchActive,
    });
  }

  renderSuggestion(
    suggestion: SearchSuggestionT,
    index: number,
    highlightedIndex: number | null,
    itemProps: any,
  ) {
    const { classes, history } = this.props;
    const isHighlighted = highlightedIndex === index;

    return (
      <MenuItem
        {...itemProps}
        key={suggestion.title + suggestion.description}
        selected={isHighlighted}
        component="div"
        className={classes.item}
        classes={{ selected: classes.selectedMenuItem }}
      >
        <SearchSuggestion
          Icon={suggestion.Icon}
          title={suggestion.title}
          description={suggestion.description}
          searchText={this.state.searchText}
          path={suggestion.path}
          history={history}
        />
      </MenuItem>
    );
  }

  downshiftStateReducer(state: DownshiftState, changes: StateChangeOptions) {
    switch (changes.type) {
      case Downshift.stateChangeTypes.blurInput:
        return {
          ...changes,
          inputValue: '',
        };
      default:
        return changes;
    }
  }

  render() {
    const { classes, history } = this.props;
    const { searchActive } = this.state;

    return (
      <React.Fragment>
        <IconButton
          color="inherit"
          aria-label="open menu"
          onClick={this.toggleSearch}
          className={classes.navIconHide}
          style={{ marginRight: 10 }}
        >
          <Search />
        </IconButton>
        <div
          className={`
          ${classes.root}
          ${searchActive ? 'active' : ''}
        `}>
          <Search
            className={classes.icon}
          />
          <Downshift
            onSelect={(item: SearchSuggestionT) => history.push(item.path)}
            stateReducer={this.downshiftStateReducer}
            itemToString={(item: SearchSuggestionT) => (item && item.title) || ''}
            render={({
              getInputProps,
              getItemProps,
              isOpen,
              inputValue,
              highlightedIndex,
              clearSelection,
            }) => (
              <div className={classes.textfieldContainer}>
                <TextField
                  fullWidth
                  className={classes.textfield}
                  autoFocus={searchActive}
                  InputProps={{
                    classes: {
                      root: classes.input,
                    },
                    ...getInputProps({
                      placeholder: 'Go to Linodes, Volumes, NodeBalancers, Domains...',
                      id: 'searchbar-simple',
                      onChange: this.handleSearchChange,
                    }),
                  }}
                />
                {isOpen &&
                  <Paper
                    className={classes.searchSuggestions}
                  >
                    {this.getSearchSuggestions(inputValue).map((suggestion, index) => {
                      return this.renderSuggestion(
                        suggestion,
                        index,
                        highlightedIndex,
                        getItemProps({ item: suggestion }),
                      );
                    })}
                  </Paper>
                }
              </div>
            )}
          />
          <IconButton
            color="inherit"
            aria-label="close menu"
            onClick={this.toggleSearch}
            className={classes.navIconHide}
          >
            <Close className={classes.close} />
          </IconButton>
        </div>
      </React.Fragment>
    );
  }
}

const RoutedSearchBar = withRouter(SearchBar);

const StyledSearchBar = withStyles(styles, { withTheme: true })<Props>(RoutedSearchBar);

const mapStateToProps = (state: Linode.AppState) => ({
  types: pathOr({}, ['resources', 'types', 'data', 'data'], state),
});

export default connect<Props>(mapStateToProps)(StyledSearchBar);
