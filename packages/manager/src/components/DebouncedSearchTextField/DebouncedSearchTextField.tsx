import Search from '@material-ui/icons/Search';
import * as React from 'react';
import { compose } from 'recompose';

import CircleProgress from 'src/components/CircleProgress';
import InputAdornment from 'src/components/core/InputAdornment';
import { makeStyles, Theme } from 'src/components/core/styles';
import TextField, { Props as TextFieldProps } from 'src/components/TextField';

import usePrevious from 'src/hooks/usePrevious';

const useStyles = makeStyles((theme: Theme) => ({
  searchIcon: {
    color: `${theme.color.grey1} !important`
  }
}));

interface Props extends TextFieldProps {
  onSearch: (query: string) => void;
  debounceTime?: number;
  isSearching?: boolean;
  className?: string;
}

type CombinedProps = Props;

const DebouncedSearch: React.FC<CombinedProps> = props => {
  const {
    className,
    isSearching,
    InputProps,
    debounceTime,
    onSearch,
    ...restOfTextFieldProps
  } = props;
  const [query, setQuery] = React.useState<string>('');
  const prevQuery = usePrevious<string>(query);

  const classes = useStyles();

  React.useEffect(() => {
    /*
      This `didCancel` business is to prevent a warning from React.
      See: https://github.com/facebook/react/issues/14369#issuecomment-468267798
    */
    let didCancel = false;
    /* 
      don't run the search if the query hasn't changed.
      This is mostly to prevent this effect from running on first mount
    */
    if (prevQuery || '' !== query) {
      setTimeout(() => {
        if (!didCancel) {
          onSearch(query);
        }
      }, debounceTime || 400);
    }
    return () => {
      didCancel = true;
    };
  }, [query]);

  const _setQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <TextField
      className={className}
      placeholder="Filter by query"
      onChange={_setQuery}
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

export default compose<CombinedProps, Props>(React.memo)(DebouncedSearch);
