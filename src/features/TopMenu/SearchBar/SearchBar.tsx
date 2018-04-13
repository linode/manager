import * as React from 'react';

import {
  withStyles,
  WithStyles,
  Theme,
  StyleRules,
} from 'material-ui/styles';
import Paper from 'material-ui/Paper';

import Search from 'material-ui-icons/Search';

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
    marginTop: 42,
    padding: theme.spacing.unit * 1,
  },
});

interface Props {}

interface State {
  searchText: string;
  searchElement?: HTMLElement;
  lastFetch?: Date;
}

type FinalProps = Props & WithStyles<Styles>;

class SearchBar extends React.Component<FinalProps, State> {
  state: State = {
    searchText: '',
  };

  showResults() {
    return this.state.searchText && this.state.searchText.length >= 3;
  }

  handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ searchText: e.target.value });
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
              Search results go here
            </Paper>
          }
        </div>
      </React.Fragment>
    );
  }
}

export default withStyles(styles, { withTheme: true })<Props>(SearchBar);
