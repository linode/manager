# Fetching Data

## Cloud Manager

Cloud Manager makes requests of the Linode API using the methods imported from the **api-v4** package:

```ts
import { getLinodes } from '@linode/api-v4/lib/linodes';

getLinodes().then({ data } => {
  console.log(data);
});
```

The **api-v4** package uses Axios for data fetching. Cloud Manager makes use of an Axios feature called "interceptors" for authentication and error shaping:

_packages/manager/src/request.tsx_ (simplified)

```ts
import { baseRequest } from "@linode/api-v4/lib/request";

// Adds the bearer token from local storage to each request
baseRequest.interceptors.request.use((config) => {
  return {
    ...config,
    headers: {
      ...config.headers,
      Authorization: token, // <-- token from local storage
    },
  };
});
```

### Fetching data in a component

The basic way to fetch data in a component is to use an api-v4 method directly:

```tsx
import * as React from 'react';
import { getProfile } from '@linode/api-v4/lib/profile';

const UsernameDisplay: React.FC<> = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<APIError | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);

  React.useEffect(() => {
    setLoading(true);
    setError(null);
    getProfile().then({ data } => {
      setProfile(data);
    }).catch(err => {
      setError(err);
    });
  }, []);

  if (loading) {
    return <span>Loading...</span>
  }

  if (error) {
    return <span>There was an error</span>
  }

  return (
    <span>Username: {profile.username}</span>
  );
}
```

This works, but has a few disadvantages:

- Loading and error state must be handled manually
- The data-fetching lifecycle must be handled manually (via useEffect)
- If the component is unmounted and then remounted, the data will be requested again (which may not be what you want)

#### React Query

A better way to fetch data is to use React Query. It address the issues listed above and has many additional features.

To fetch data with React Query, check to see if the API method you want to use has a query written for it in `packages/manager/src/queries`. If not, feel free to write one. It should look something like this:

```ts
import { getProfile, Profile } from "@linode/api-v4/lib/profile";
import { APIError } from "@linode/api-v4/lib/types";
import { useQuery } from "react-query";

const queryKey = "profile";

export const useProfile = () =>
  useQuery<Profile, APIError[]>(queryKey, getProfile);
```

The results of the query will be cached in memory. The first time `useProfile()` is called, the data is fetched from the API. On subsequent calls, the data is retrieved from the in-memory cache.

`useQuery` accepts a third "options" parameter, which can be used to specify cache time (among others things). For example, to specify that the cache should never expire:

```ts
// ...other imports
import { queryPresets } from "src/queries/base";

export const useProfile = () =>
  useQuery<Profile, APIError[]>(
    queryKey,
    getProfile,
    queryPresets.oneTimeFetch
  );
```

Loading and error states are managed by React Query. The example above becomes greatly simplified:

```tsx
import * as React from "react";
import { useProfile } from "src/queries/profile";

const UsernameDisplay: React.FC<> = () => {
  const { loading, error, data: profile } = useProfile();

  if (loading) {
    return <span>Loading...</span>;
  }

  if (error) {
    return <span>There was an error</span>;
  }

  return <span>Username: {profile.username}</span>;
};
```

#### Old pattern: Redux Thunks

Before React Query, Redux was used to store API data, loading, and error states. Actions were dispatched to request data, and components used HOCs to connect to the store. A minimal example:

```tsx
// ---- OLD PATTERN, DON'T USE ---- //

import * as React from "react";
import profileContainer, {
  Props as ProfileProps,
} from "src/containers/profile.container";

const UsernameDisplay: React.FC<ProfileProps> = (props) => {
  const { requestProfile, profileLoading, profileError, profileData } = props;

  React.useEffect(() => requestProfile, []);

  if (profileLoading) {
    return <span>Loading...</span>;
  }

  if (profileError) {
    return <span>There was an error</span>;
  }

  return <span>Username: {profileData.username}</span>;
};
```
