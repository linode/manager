import * as React from 'react';

import * as ClassNames from 'classnames';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import InputAdornment from '@material-ui/core/InputAdornment';
import Search from '@material-ui/icons/Search';

import { debounce } from 'throttle-debounce';

import CircleProgress from 'src/components/CircleProgress';
import TextField from 'src/components/TextField';

type ClassNames = 'root' | 'searchIcon';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  searchIcon: {
    color: `${theme.color.grey1} !important`,
  },
});

interface Props {
  placeholderText: string;
  onSearch: (value: string) => void;
  className?: string;
  isSearching?: boolean;
  toolTipText?: string;
}

interface State {
  query: string;
  debouncedSearch: Function;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class DebouncedSearchTextField extends React.Component<CombinedProps, State> {

  public state: State = {
    query: '',
    debouncedSearch: debounce(400, false, this.props.onSearch)
  };

  handleChangeQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { debouncedSearch } = this.state;
    this.setState({ query: e.target.value });
    debouncedSearch(e.target.value);
  }

  render() {
    const { query } = this.state;
    const {
      classes,
      className,
      placeholderText,
      isSearching,
      toolTipText
    } = this.props;

    return (
      <React.Fragment>
        <TextField
          tooltipText={toolTipText}
          fullWidth
          InputProps={{
            placeholder: placeholderText,
            value: query,
            onChange: this.handleChangeQuery,
            startAdornment:
              <InputAdornment position="end">
                <Search className={classes.searchIcon} />
              </InputAdornment>,
            endAdornment:
              isSearching
                ? <InputAdornment position="end">
                  <CircleProgress mini={true} />
                </InputAdornment>
                : <React.Fragment />
          }}
          className={ClassNames(
            className,
          )}
        />
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(DebouncedSearchTextField);
