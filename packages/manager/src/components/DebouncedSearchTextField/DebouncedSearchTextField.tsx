import Search from '@material-ui/icons/Search';
import * as React from 'react';
import { compose } from 'recompose';
import { debounce } from 'throttle-debounce';

import CircleProgress from 'src/components/CircleProgress';
import InputAdornment from 'src/components/core/InputAdornment';
import { makeStyles, Theme } from 'src/components/core/styles';
import TextField, { Props as TextFieldProps } from 'src/components/TextField';

const useStyles = makeStyles((theme: Theme) => ({
  searchIcon: {
    color: `${theme.color.grey1} !important`
  }
}));

interface Props<T extends any = any> extends TextFieldProps {
  // updateList: (list: T | undefined) => void;
  originalList: T;
  onSearch: (query: string, originalList: T) => void;
  debounceTime?: number;
  isSearching?: boolean;
  className?: string;
}

type CombinedProps = Props;

const ClientSearch: React.FC<CombinedProps> = props => {
  const { className, isSearching, InputProps, debounceTime, originalList, onSearch, ...restOfTextFieldProps } = props;
  const [query, setQuery] = React.useState<string>('');

  const classes = useStyles();

  React.useEffect(() => {
    if (debounceTime) {
      debounce(debounceTime, false, () => {
        onSearch(query, originalList);
      })()
    } else {
      onSearch(query, originalList);
    }
  }, [query]);

  return (
    <TextField
      className={className}
      placeholder="Filter by query"
      onChange={e => setQuery(e.target.value)}
      InputProps={{
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
          ),
        ...InputProps
      }}
      {...restOfTextFieldProps}
    />
  );
};

export default compose<CombinedProps, Props>(React.memo)(ClientSearch) as unknown as <T>(props: Props<T>) => React.ReactElement;
