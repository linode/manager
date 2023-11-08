import Search from '@mui/icons-material/Search';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { CircleProgress } from 'src/components/CircleProgress';
import { InputAdornment } from 'src/components/InputAdornment';
import { TextField, TextFieldProps } from 'src/components/TextField';
import { usePrevious } from 'src/hooks/usePrevious';

interface DebouncedSearchProps extends TextFieldProps {
  className?: string;
  debounceTime?: number;
  defaultValue?: string;
  hideLabel?: boolean;
  isSearching?: boolean;
  onSearch: (query: string) => void;
  placeholder?: string;
}

const DebouncedSearch = (props: DebouncedSearchProps) => {
  const {
    InputProps,
    className,
    debounceTime,
    defaultValue,
    hideLabel,
    isSearching,
    label,
    onSearch,
    placeholder,
    ...restOfTextFieldProps
  } = props;
  const [query, setQuery] = React.useState<string>('');
  const prevQuery = usePrevious<string>(query);

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
    if ((prevQuery || '') !== query) {
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
      InputProps={{
        endAdornment: isSearching ? (
          <InputAdornment position="end">
            <CircleProgress mini={true} />
          </InputAdornment>
        ) : (
          <React.Fragment />
        ),
        startAdornment: (
          <InputAdornment position="end">
            <StyledSearchIcon />
          </InputAdornment>
        ),
        ...InputProps,
      }}
      sx={{
        '& input::placeholder': {
          color: 'green',
        },
        '& input': {
          color: 'green',
        },
      }}
      className={className}
      data-qa-debounced-search
      defaultValue={defaultValue}
      hideLabel={hideLabel}
      label={label}
      onChange={_setQuery}
      placeholder={placeholder || 'Filter by query'}
      {...restOfTextFieldProps}
    />
  );
};

export const DebouncedSearchTextField = React.memo(DebouncedSearch);

const StyledSearchIcon = styled(Search)(({ theme }) => ({
  '&&, &&:hover': {
    color: theme.color.grey1,
  },
}));
