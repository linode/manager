import {
  FormError,
  FormField,
  LoadingSpinner,
} from '@akamai/cds-components/react';
import { SearchField } from '@akamai/cds-components/react/SearchField';
import * as React from 'react';
import { useEffect } from 'react';
import { debounce } from 'throttle-debounce';

interface Props {
  errorText?: string;
  isLoading?: boolean;
  onSearch: (value: string) => void;
  value: string;
}

export const VolumesSearchField = ({
  value,
  onSearch,
  errorText,
  isLoading,
}: Props) => {
  const debouncedRef = React.useRef<null | ReturnType<typeof debounce>>(null);

  useEffect(() => {
    // Cancel any pending call from a previous instance.
    debouncedRef.current?.cancel();

    debouncedRef.current = debounce(400, (value: string) => {
      onSearch(value);
    });

    return () => {
      debouncedRef.current?.cancel();
    };
  }, [onSearch]);

  return (
    <FormField error={!!errorText} style={{ margin: 0 }}>
      <span style={{ position: 'relative', maxWidth: '416px' }}>
        <SearchField
          error={!!errorText}
          onChange={(e) =>
            debouncedRef.current?.(
              (e.detail as { value: string }).value as string
            )
          }
          placeholder="Search Volumes"
          style={{ width: '100%' }}
          value={value}
        />
        {isLoading && (
          <LoadingSpinner
            size="small"
            style={{ position: 'absolute', right: '26px', top: '9px' }}
          />
        )}
      </span>
      <FormError slot="error">{errorText}</FormError>
    </FormField>
  );
};
