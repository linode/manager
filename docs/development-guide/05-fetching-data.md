# Fetching Data

Cloud Manager makes requests of the Linode API using the methods imported from the **api-v4** package:

```ts
import { getLinodes } from '@linode/api-v4/lib/linodes';

getLinodes().then({ data } => {
  console.log(data);
});
```

The **api-v4** package also exposes a `baseRequest`, which is the [Axios](https://axios-http.com/docs/intro) instance used for individual API methods.

The `baseRequest` is used by Cloud Manager for authentication and error shaping:

```ts
// packages/manager/src/request.tsx (simplified)

import { baseRequest } from "@linode/api-v4/lib/request";

// Adds the bearer token from local storage to each request, using an interceptor
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

The basic way to fetch data in a component is to use an **api-v4** method directly:

```tsx
import * as React from 'react';
import { getProfile } from '@linode/api-v4/lib/profile';
// ... other imports

const UsernameDisplay = () => {
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

To fetch data with React Query:

- Create an `@linode/api-v4` function that calls the intended Linode API endpoint.
- Create a query key factory that uses the newly created `@linode/api-v4` function.
- Create a hook that wraps `useQuery` and uses the query key factory.

```ts
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@linode/api-v4";
import type { APIError, Profile } from "@linode/api-v4";

const profileQueries = createQueryKeys('profile', {
  profile: {
    queryFn: getProfile,
    queryKey: null,
  },
});

export const useProfile = () =>
  useQuery<Profile, APIError[]>(profileQueries.profile);
```

The first time `useProfile()` is called, the data is fetched from the API. On subsequent calls, the data is retrieved from the in-memory cache.

`useQuery` accepts options which can be used to specify cache time (among others things). For example, to specify that the cache should never expire for this query:

```ts
import { queryPresets } from "src/queries/base";

const profileQueries = createQueryKeys('profile', {
  profile: {
    queryFn: getProfile,
    queryKey: null,
  },
});

export const useProfile = () =>
  useQuery<Profile, APIError[]>({
    ...profileQueries.profile,
    ...queryPresets.oneTimeFetch,
  });
```

Loading and error states are managed by React Query. The earlier username display example becomes greatly simplified:

```tsx
import * as React from "react";
import { useProfile } from "src/queries/profile";

const UsernameDisplay = () => {
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

## When to use React Query or an api-v4 method directly

Because **api-v4** methods don't commit data to a cache, it is acceptable to use **api-v4** methods directly
when performing **_one-time actions_** that do not require any immediate state change in Cloud Manager's UI.

While use of **api-v4** methods directly are acceptable, use of **React Query** Queries or Mutations are **still prefered** for the benefits described above.

A minimal example of acceptable direct **api-v4** use:

```ts
resetKubeConfig({ id }).then(() => {
  setResetKubeConfigDialogOpen(false);
  enqueueSnackbar('Successfully reset Kubeconfig');
});
```

#### Old pattern: Redux Thunks

Before React Query, Redux was used to store API data, loading, and error states. Actions were dispatched to request data, and components used HOCs to connect to the store. A minimal example:

```tsx
// ---- OLD PATTERN, DON'T USE ---- //

import * as React from "react";
import profileContainer, {
  Props as ProfileProps,
} from "src/containers/profile.container";

const UsernameDisplay = (props: ProfileProps) => {
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

### Error Handling

#### API Error arrays

Components making API requests generally expect to work with an array of Linode API errors. These have the shape:

```js
{ field: 'field-name', reason: 'why this error occurred' }
```

We have added an interceptor to our Axios instance that essentially guarantees that any error from an API function will have this shape. For example, if you block network requests using Chrome Dev Tools, there is no response from the API. But if you `.catch()` this error, you'll find that it has the above shape, with a default message ("An unexpected error occurred.").

This makes it easy to work with errors, but the default message is not very situation specific. Often, what we want is to use a real error message from the API if it is available, and use a situation-specific fallback message otherwise. We have a helper in our utilities directory for this called `getAPIErrorOrDefault`.

```js
import { getAPIErrorOrDefault } from "src/utilities/errorUtils";

apiRequest().catch((error) => {
  const apiError = getAPIErrorOrDefault(
    error, // If this is an array of API field errors, it will be returned unchanged.
    "Your Linode is hopelessly broken.", // If no field errors are present, an array consisting of an error with this reason is returned.
    "linode-id" // Optional. If you want the default field error to have a `field` property, this argument will be used.
  );
});
```

#### Error Maps

The usual pattern is to map field errors to the appropriate field, showing a generalError for any errors that don't have a field. For example, a form might have an input for `region`, and that element will display any errors with `{ field: 'region', reason: 'whatever' }` inline. In some cases, however, we either aren't checking for every possible error field, or we aren't entirely sure what all of the possible fields the API is considering are. To make sure that we catch these and show them to the user, use the `getErrorMap` helper:

```js
import { getErrorMap } from "src/utilities/errorUtils";

apiRequest().catch((error) => {
  const errorMap = getErrorMap(
    ["label", "region"], // Fields we want to check for
    error
  );
  const labelError = errorMap.label;
  const regionError = errorMap.region;
  const generalError = errorMap.none;
});
```

`errorMap` will be an object with one key for each of the fields we specified, and a `none` key that captures any errors (the first
one it finds) that don't match the provided fields:

```js
console.log(errorMap);
{
  label: 'a label error',
  region: 'a region error',
  none: 'a linode_id error or similar'
}
```

#### Scrolling to errors

For deep forms, we provide a utility that will scroll to the first error encountered within a defined container. We do this to improve error visibility, because the user can be unaware of an error that isn't in the viewport.
An error can be a notice (API error) or a Formik field error. In order to implement this often needed functionality, we must declare a form or form container via ref, then pass it to the `scrollErrorIntoViewV2` util (works both for class & functional components).

Note: the legacy `scrollErrorIntoView` is deprecated in favor of `scrollErrorIntoViewV2`.

Since Cloud Manager uses different ways of handling forms and validation, the `scrollErrorIntoViewV2` util should be implemented using the following patterns to ensure consistency.

##### Formik (deprecated)

```Typescript
import * as React from 'react';

import { scrollErrorIntoViewV2 } from '@linode/utilities';

export const MyComponent = () => {
  const formContainerRef = React.useRef<HTMLFormElement>(null);

  const {
    values,
    // other handlers
  } = useFormik({
    initialValues: {},
    onSubmit: mySubmitFormHandler,
    validate: () => {
      scrollErrorIntoViewV2(formRef);
    },
    validationSchema: myValidationSchema,
  });

  return (
    <form onSubmit={handleSubmit} ref={formContainerRef}>
      <Error />
      {/* form fields */}
      <button type="submit">Submit</button>
    </form>
  );
};
```

##### React Hook Forms

```Typescript
import * as React from 'react';

import { scrollErrorIntoViewV2 } from '@linode/utilities';

export const MyComponent = () => {
  const formContainerRef = React.useRef<HTMLFormElement>(null);

  const methods = useForm<LinodeCreateFormValues>({
    defaultValues,
    mode: 'onBlur',
    resolver: myResolvers,
    // other methods
  });

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit, () => scrollErrorIntoViewV2(formRef))}
        ref={formContainerRef}
      >
        <Error />
        {/* form fields */}
        <button type="submit">Submit</button>
      </form>
    </>
  );
};
```

##### Uncontrolled forms

```Typescript
import * as React from 'react';

import { scrollErrorIntoViewV2 } from '@linode/utilities';

export const MyComponent = () => {
  const formContainerRef = React.useRef<HTMLFormElement>(null);

  const handleSubmit = () => {
    try {
      // form submission logic
    } catch {
      scrollErrorIntoViewV2(formContainerRef);
    }
  };

  return (
    <form onSubmit={handleSubmit} ref={formContainerRef}>
      <Error />
      {/* form fields */}
      <button type="submit">Submit</button>
    </form>
  );
};
```

### Toast / Event Message Punctuation

**Best practice:**

- If a message is a sentence or a sentence fragment with a subject and a verb, add punctuation. Otherwise, leave punctuation off.
- If a developer notices inconsistencies within files they are already working in, they can progressively fix them. In this case, be prepared to fix any Cypress test failures.
