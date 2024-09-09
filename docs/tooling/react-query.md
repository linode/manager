# React Query

[TanStack Query](https://tanstack.com/query/latest) (formerly React Query) is Cloud Manager's primary tool for fetching and caching API data. For a quick introduction, read our [Fetching Data](../development-guide/05-fetching-data.md#react-query) development guide. 

You can find all of Cloud Manager's queries and mutations in `packages/manager/src/queries`.

## Query Keys

React Query's cache is a simple key-value store. Query Keys are serializable strings that uniquely identify a query's data in the cache. You can read more about the concept [here](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys) in the TanStack Query docs.

Because of Cloud Manager's complexity, we use [`@lukemorales/query-key-factory`](https://github.com/lukemorales/query-key-factory) to manage our query keys. This package allows us to define query key _factories_ that enable typesafe standardized query keys that can be reused and referenced throughout the application.

### Examples

#### Simple Query

> [!note]
> Queries that have no parameters _must_ specify `null` for the query key. 
> Using `null` tells the query key factory to not append any params to the query key.
> (See the profile example below)


```ts
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@linode/api-v4";
import type { APIError, Profile } from "@linode/api-v4";

const profileQueries = createQueryKeys('profile', {
  profile: {
    queryFn: getProfile,
    queryKey: null, // queryKey will be ["profile", "profile"]
  },
});

export const useProfile = () =>
  useQuery<Profile, APIError[]>(profileQueries.profile);
```

#### Query with parameters

> [!important]
> Queries that have parameters should always include the parameters in the `queryKey`

```ts
import { useQuery } from "@tanstack/react-query";
import { getLinode } from "@linode/api-v4";
import type { APIError, Linode } from "@linode/api-v4";

const linodeQueries = createQueryKeys('linodes', {
  linode: (id: number) => ({
    queryFn: () => getLinode(id),
    queryKey: [id], // queryKey will be ["linodes", "linode", id]
  }),
});

export const useLinodeQuery = (id: number) =>
  useQuery<Linode, APIError[]>(linodeQueries.linode(1));
```

### Additional Reading on Query Keys

- https://tkdodo.eu/blog/effective-react-query-keys#effective-react-query-keys
- https://tanstack.com/query/latest/docs/framework/react/guides/query-keys

## Maintaining the Cache

A significant challenge of React Query is keeping the client state in sync with the server. 

The two easiest ways of updating the cache using React Query are
- Using `invalidateQueries` to mark data as stale (which will trigger a refetch the next time the query is mounted) 
- Using `setQueryData` to manually update the cache

> [!note]
> Place `invalidateQueries` and `setQueryData` calls in the `onSuccess` of `useMutation` hooks
> whenever possible.

### `invalidateQueries`

This will mark data as stale in the React Query cache, which will cause Cloud Manager to refetch the data if the corresponding query is mounted.

Use `invalidateQueries` when:
- You are dealing with any *paginated data* (because order may have changed)
- You want fresh data from the API 

> [!note]
> When using `invalidateQueries`, use a query key factory to ensure you are invalidating the data at the correct query key. 

### `setQueryData`

Use this if you have data readily available to put in the cache. This often happens when you make a PUT request.

### Example

This example shows how we keep the cache up to date when performing create / update / delete operations
on an entity.

```ts
import { useQuery, useMutation } from "@tanstack/react-query";
import { getLinode, getLinodes, updateLinode, deleteLinode, createLinode } from "@linode/api-v4";
import type { APIError, Linode, ResourcePage } from "@linode/api-v4";

const linodeQueries = createQueryKeys('linodes', {
  linode: (id: number) => ({
    queryFn: () => getLinode(id),
    queryKey: [id], // queryKey will be ["linodes", "linode", id]
  }),
  paginated: (params: Params = {}, filter: Filter = {}) => ({
    queryFn: () => getLinodes(params, filter),
    queryKey: [params, filter], // queryKey will be ["linodes", "paginated", params, filter]
  }),
});

export const useLinodeQuery = (id: number) =>
  useQuery<Linode, APIError[]>(linodeQueries.linode(1));

export const useLinodeUpdateMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<Linode, APIError[], Partial<Linode>>({
    mutationFn: (data) => updateLinode(id, data),
    onSuccess(linode) {
      // Invalidate all paginated pages in the cache.
      queryClient.invalidateQueries({
        queryKey: linodeQueries.paginated._def
      });
      // Because we have the updated Linode, we can manually set the cache for the `useLinode` query.
      queryClient.setQueryData(linodeQueries.linode(id).queryKey, linode);
    },
  });
}

export const useDeleteLinodeMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => deleteLinode(id),
    onSuccess() {
      // Invalidate all paginated pages in the cache.
      queryClient.invalidateQueries({
        queryKey: linodeQueries.paginated._def
      });
      // Remove the deleted linode from the cache
      queryClient.removeQueries(linodeQueries.linode(id).queryKey);
    },
  });
};

export const useCreateLinodeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Linode, APIError[], CreateLinodeRequest>({
    mutationFn: createLinode,
    onSuccess(linode) {
      // Invalidate all paginated pages in the cache. We don't know what page the new Linode will be on.
      queryClient.invalidateQueries({
        queryKey: linodeQueries.paginated._def
      });
      // Because we have the new Linode, we can manually set the cache for the `useLinode` query.
      queryClient.setQueryData(linodeQueries.linode(id).queryKey, linode);
    },
  });
}
```

## Frequently Asked Questions

### Are we storing duplicated data in the cache? Why?

Yes, there is potential for the same data to exist many times in the cache.

For example, we have a query `useVolumesQuery` with the query key `["volumes", "paginated", { page: 1 }]` that contains the first 100 volumes on your account.
One of those same volumes could also be stored in the cache by using `useVolumeQuery` with query key `["volumes", "volume", 5]`.
This creates a scenario where the same volume is cached by React Query under multiple query keys.

This is a legitimate disadvantage of React Query's caching strategy. **We must be aware of this when we perform cache updates (using invalidations or manually updating the cache) so that the entity is updated everywhere in the cache.**

Some data fetching tools like Apollo Client are able to intelligently detect duplicate entities and merge them. React Query does not do this. See [this tweet](https://twitter.com/tannerlinsley/status/1557395389531074560) from the creator of React Query.