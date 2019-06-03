import { WithStyles } from '@material-ui/core/styles';
import Search from '@material-ui/icons/Search';
import * as ClassNames from 'classnames';
import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import InputAdornment from 'src/components/core/InputAdornment';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import TextField from 'src/components/TextField';
import { debounce } from 'throttle-debounce';

type ClassNames = 'root' | 'searchIcon';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    searchIcon: {
      color: `${theme.color.grey1} !important`
    }
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
  };

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
            startAdornment: (
              <InputAdornment position="end">
                <Search className={classes.searchIcon} />
              </InputAdornment>
            ),
            endAdornment: isSearching ? (
              <InputAdornment position="end">
                <CircleProgress mini={true} />
              </InputAdornment>
            ) : (
              <React.Fragment />
            )
          }}
          className={ClassNames(className)}
          data-qa-debounced-search
        />
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

export default styled(DebouncedSearchTextField);
