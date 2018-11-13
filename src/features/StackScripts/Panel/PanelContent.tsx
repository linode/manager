import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import * as React from 'react';

import DebouncedSearch from 'src/components/DebouncedSearchTextField';

import StackScriptTable from './Table/StackScriptTable';

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
    backgroundColor: theme.color.white,
  },
});

interface Props {
  type: 'own' | 'linode' | 'community';
}

type CombinedProps = Props & WithStyles<ClassNames>;

class PanelContent extends React.Component<CombinedProps, {}> {
  handleSearch = () => null;

  render() {
    const { classes, type } = this.props;
    return (
      <React.Fragment>
        <DebouncedSearch
          placeholderText='Search by Label, Username, or Description'
          onSearch={this.handleSearch}
          className={classes.searchBar}
          isSearching={false}
        /** uncomment when we upgrade to MUI v3 */
        // toolTipText={`Hint: try searching for a specific item by prepending your
        // search term with "username:", "label:", or "description:"`}
        />
        <StackScriptTable type={type} />
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(PanelContent);
