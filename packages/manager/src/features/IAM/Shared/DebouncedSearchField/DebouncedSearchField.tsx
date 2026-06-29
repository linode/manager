import { SearchField } from '@akamai/cds-components/react';
import * as React from 'react';
import type { ComponentProps } from 'react';
import { debounce } from 'throttle-debounce';

type SearchFieldProps = ComponentProps<typeof SearchField>;

export interface DebouncedSearchFieldProps
  extends Omit<SearchFieldProps, 'onChange' | 'value'> {
  /**
   * Interval in milliseconds before `onSearch` is called.
   * @default 250
   */
  debounceTime?: number;
  onSearch: (query: string) => void;
  value: string;
}

export const DebouncedSearchField = React.memo(
  (props: DebouncedSearchFieldProps) => {
    const { debounceTime = 250, onSearch, value, ...searchFieldProps } = props;

    const [searchValue, setSearchValue] = React.useState(value);
    const prevValueRef = React.useRef(value);

    if (value !== prevValueRef.current) {
      prevValueRef.current = value;

      if (value !== searchValue) {
        setSearchValue(value);
      }
    }

    const onSearchRef = React.useRef(onSearch);
    onSearchRef.current = onSearch;

    const debouncedSearch = React.useMemo(
      () =>
        debounce(debounceTime, (nextValue: string) => {
          onSearchRef.current(nextValue);
        }),
      [debounceTime]
    );

    React.useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

    const handleChange = React.useCallback(
      (e: CustomEvent<{ value: string }>) => {
        const nextValue = e.detail.value;
        setSearchValue(nextValue);
        debouncedSearch(nextValue);
      },
      [debouncedSearch]
    );

    return (
      <SearchField
        {...searchFieldProps}
        onChange={handleChange}
        value={searchValue}
      />
    );
  }
);
