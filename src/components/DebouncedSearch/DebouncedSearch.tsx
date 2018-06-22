import * as React from 'react';

import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';

// import { debounce } from 'throttle-debounce';

import TextField from 'src/components/TextField';


type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  onSearch: any;
}

interface State {
  query: string;
  // debouncedSearch: Function;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class DebouncedSearch extends React.Component<CombinedProps, State> {

  public state: State = {
    query: '',
    // debouncedSearch: debounce(400, false, this.props.onSearch)
  };

  handleChangeQuery = (e: any) => {
    // const { debouncedSearch } = this.state;
    this.setState({ query: e.target.value });
    // debouncedSearch(e.target.value);
  }

  render() {
    const { query } = this.state;
    return (
      <React.Fragment>
        <TextField
          fullWidth
          InputProps={{
            placeholder: 'Search for StackScript by Label or Description',
            value: query,
            onChange: this.handleChangeQuery,
          }}
        />
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(DebouncedSearch);
