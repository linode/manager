import * as React from 'react';

import {
  withStyles,
  WithStyles,
  Theme,
  StyleRules,
} from 'material-ui/styles';
import Input from 'material-ui/Input';

import Search from 'material-ui-icons/Search';

import LinodeTheme from 'src/theme';
import Paper from 'material-ui/Paper';

interface Props {}

interface State {
  searchText: string;
  searchElement?: HTMLElement;
}

const styles = (theme: Theme & Linode.Theme): StyleRules => ({
  root: {
    position: 'relative',
    display: 'flex',
    flexGrow: 1,
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
  input: {
    color: '#606469',
    flexGrow: 1,
    marginLeft: theme.spacing.unit,
  },
  searchResults: {
    position: 'absolute',
    left: 0,
    right: 0,
    marginTop: 40,
    padding: theme.spacing.unit * 1,
  },
});

type Styles =
  'root'
  | 'input'
  | 'icon'
  | 'searchResults';

type FinalProps = Props & WithStyles<Styles>;

class SearchBar extends React.Component<FinalProps, State> {
  state = {
    searchText: '',
    searchElement: undefined,
  };

  showResults() {
    return this.state.searchText.length >= 3;
  }

  handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ searchText: e.target.value }); 
  }

  render() {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <div 
          id="search-bar"
          ref="searchBar"
          className={classes.root}
        >
          <Search 
            className={classes.icon}
            fontSize
          />
          <Input
            disableUnderline
            placeholder="Go to Linodes, Volumes, NodeBalancers, Domains..."
            className={classes.input}
            inputProps={{
              'aria-label': 'Search',
            }}
            value={this.state.searchText}
            onChange={this.handleSearchChange}
          />
          {this.showResults() &&
            <Paper
              className={classes.searchResults}
              id="search-menu"
            >
              Search results go here
            </Paper>
          }
        </div>
      </React.Fragment>
    );
  }
}

export default withStyles(styles, { withTheme: true })<Props>(SearchBar);

