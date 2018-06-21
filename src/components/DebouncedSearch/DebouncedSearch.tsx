import * as React from 'react';

import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';

import { debounce } from 'throttle-debounce';

import TextField from 'src/components/TextField';


type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  onSearch: (value: string) => void;
}

interface State {
  query: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class DebouncedSearch extends React.Component<CombinedProps, State> {
  state: State = {
    query: ''
  };

  handleChangeQuery = (e: any) => {
    // const { onSearch } = this.props;
    this.setState({ query: e.target.value });
    debounce(200, false, () => console.log('hello world'));
  }

  render() {
    const { query } = this.state;
    return (
      <React.Fragment>
        <TextField
          fullWidth
          // autoFocus={}
          InputProps={{
            placeholder: 'search for something',
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
