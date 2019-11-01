import Search from '@material-ui/icons/Search';
import * as React from 'react';
import { compose } from 'recompose';

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
  const {
    className,
    isSearching,
    InputProps,
    debounceTime,
    originalList,
    onSearch,
    ...restOfTextFieldProps
  } = props;
  const [query, setQuery] = React.useState<string>('');

  const classes = useStyles();

  React.useEffect(() => {
    /* This `didCancel` business is to prevent a warning from React.
     * See: https://github.com/facebook/react/issues/14369#issuecomment-468267798
     */
    let didCancel = false;

    if (debounceTime) {
      setTimeout(() => {
        if (!didCancel) {
          onSearch(query, originalList);
        }
      }, debounceTime);
    } else {
      onSearch(query, originalList);
    }
    return () => {
      didCancel = true;
    };
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

export default (compose<CombinedProps, Props>(React.memo)(
  ClientSearch
) as unknown) as <T>(props: Props<T>) => React.ReactElement;
