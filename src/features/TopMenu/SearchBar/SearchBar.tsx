import * as React from 'react';
import Axios from 'axios';

import {
  withStyles,
  WithStyles,
  Theme,
  StyleRules,
} from 'material-ui/styles';
import Paper from 'material-ui/Paper';

import Search from 'material-ui-icons/Search';

import LinodeIcon from 'src/assets/addnewmenu/linode.svg';
import VolumeIcon from 'src/assets/addnewmenu/volume.svg';
import { API_ROOT } from 'src/constants';
import LinodeTheme from 'src/theme';
import TextField from 'src/components/TextField';


type Styles =
  'root'
  | 'textfield'
  | 'input'
  | 'icon'
  | 'searchResults';

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
  },
  icon: {
    color: '#c9cacb',
    fontSize: '2rem',
  },
  textfield: {
    color: '#606469',
    flex: 1,
    '& input': {
      fontSize: '1.0em',
    },
  },
  input: {
    border: 0,
  },
  searchResults: {
    position: 'absolute',
    left: 0,
    right: 0,
    marginTop: 50,
    padding: theme.spacing.unit * 1,
  },
});

interface SearchResult {
  title: string;
  description: string;
  Icon: React.ComponentClass<any>;
}

interface Props {}

interface State {
  searchText: string;
  searchResults?: SearchResult[];
  linodes?: Linode.Linode[];
  volumes?: Linode.Volume[];
  nodebalancers?: Linode.NodeBalancer[];
  domains?: Linode.Domain[];
}

type FinalProps = Props & WithStyles<Styles>;

class SearchBar extends React.Component<FinalProps, State> {
  state: State = {
    searchText: '',
  };

  componentDidMount() {
    Axios.get(`${API_ROOT}/linode/instances/`)
      .then((response) => {
        this.setState({ linodes: response.data.data });
        this.search(this.state.searchText);
      });

    Axios.get(`${API_ROOT}/volumes`)
      .then((response) => {
        this.setState({ volumes: response.data.data });
        this.search(this.state.searchText);
      });

    Axios.get(`${API_ROOT}/nodebalancers`)
      .then((response) => {
        this.setState({ nodebalancers: response.data.data });
        this.search(this.state.searchText);
      });

    Axios.get(`${API_ROOT}/domains`)
      .then((response) => {
        this.setState({ domains: response.data.data });
        this.search(this.state.searchText);
      });
  }

  dataAvailable() {
    return (
      this.state.linodes
      || this.state.volumes
      || this.state.nodebalancers
      || this.state.domains
    );
  }

  showResults() {
    return (
      this.dataAvailable()
      && this.state.searchResults
      && this.state.searchResults.length
      && this.state.searchText
      && this.state.searchText.length >= 3
    );
  }

  search(query: string) {
    if (!this.dataAvailable) return;

    const searchResults = [];

    if (this.state.linodes) {
      const linodesByLabel = this.state.linodes.filter(
        linode => linode.label.toLowerCase().includes(query.toLowerCase()),
      );
      searchResults.push(...(linodesByLabel.map(linode => ({
        title: linode.label,
        description: linode.type,
        Icon: LinodeIcon,
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
      }))));
    }

    this.setState({ searchResults });
  }

  handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ searchText: e.target.value });
    this.search(e.target.value);
  }

  render() {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <div
          className={classes.root}
        >
          <Search
            className={classes.icon}
          />
          <TextField
            placeholder="Go to Linodes, Volumes, NodeBalancers, Domains..."
            className={classes.textfield}
            InputProps={{
              'aria-label': 'Search',
              className: classes.input,
            }}
            value={this.state.searchText}
            onChange={this.handleSearchChange}
          />
          {this.showResults() &&
            <Paper
              className={classes.searchResults}
            >
              {this.state.searchResults && this.state.searchResults.map((result) => {
                return (
                  <div style={{ display: 'flex' }}>
                    <div><result.Icon /></div>
                    <div>
                      <div>{result.title}</div>
                      <div>{result.description}</div>
                    </div>
                  </div>
                );
              })}
            </Paper>
          }
        </div>
      </React.Fragment>
    );
  }
}

export default withStyles(styles, { withTheme: true })<Props>(SearchBar);
