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

interface Props {}

interface State {
  searchText?: string;
}

const styles = (theme: Theme & Linode.Theme): StyleRules => ({
  root: {
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
    flexGrow: 1,
    marginLeft: theme.spacing.unit,
  },
});

type Styles =
  'root'
  | 'input'
  | 'icon';

type FinalProps = Props & WithStyles<Styles>;

class SearchBar extends React.Component<FinalProps, State> {
  state = {
    searchText: undefined,
  };

  render() {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <div className={classes.root}>
          <Search 
            className={classes.icon}
            fontSize
          />
          <Input
            disableUnderline
            placeholder="Placeholder"
            className={classes.input}
            inputProps={{
              'aria-label': 'Search',
            }}
          />
        </div>
      </React.Fragment>
    );
  }
}

export default withStyles(styles, { withTheme: true })<Props>(SearchBar);

