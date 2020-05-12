import useDomains from 'src/hooks/useDomains';

export type PreFetchEntity = 'domains'; // More entity types will go here.

/**
 * usePreFetch() accepts an array of dependencies and fetches them from the API if they are not
 * already in the Redux Store.
 *
 * It's similar to useReduxLoad(), but it ONLY fetches data if it hasn't been requested at all yet.
 * In other words, there's no refresh interval. It's meant to give a "head start", if for example
 * the user hovers over the "Domains" link, we want to request the data in the background because
 * they may end up clicking it. But if we already have some domains data, we don't re-fetch, since
 * that would trigger loading states, etc. We leave the ultimate authority to the consumers of the
 * data to decide when the data should be refreshed.
 *
 * Usage:
 * const preFetch = usePreFetch();
 *
 * <div onmouseenter={() => preFetch(['linodes', 'images'])}>Linodes</div>
 */
export const usePreFetch = () => {
  const { domains, requestDomains } = useDomains();

  return (entitiesToFetch: PreFetchEntity[]) => {
    entitiesToFetch.forEach(thisPreFetchEntity => {
      if (
        thisPreFetchEntity === 'domains' &&
        domains.lastUpdated === 0 &&
        !domains.loading
      ) {
        requestDomains();
      }
      // More entity types will go here.
    });
  };
};

export default usePreFetch;
