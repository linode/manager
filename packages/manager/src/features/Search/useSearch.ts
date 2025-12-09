import { FORCE_SEARCH_TYPE } from 'src/constants';
import { useIsLargeAccount } from 'src/hooks/useIsLargeAccount';

import { useAPISearch } from './useAPISearch';
import { useClientSideSearch } from './useClientSideSearch';

interface Props {
  query: string;
}

export const useSearch = ({ query }: Props) => {
  const isSearching = Boolean(query);
  const isLargeAccount = useIsLargeAccount(isSearching);
  const isAccountSizeKnown = isLargeAccount !== undefined;

  const shouldUseClientSideSearch = FORCE_SEARCH_TYPE
    ? FORCE_SEARCH_TYPE === 'client'
    : isLargeAccount === false;

  const clientSideSearchData = useClientSideSearch({
    enabled: isSearching && isAccountSizeKnown && shouldUseClientSideSearch,
    query,
  });

  const apiSearchData = useAPISearch({
    enabled: isSearching && isAccountSizeKnown && !shouldUseClientSideSearch,
    query,
  });

  const data = shouldUseClientSideSearch ? clientSideSearchData : apiSearchData;

  return {
    ...data,
    isLargeAccount,
  };
};
