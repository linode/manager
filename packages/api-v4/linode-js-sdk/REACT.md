## React Example

Here's a common case on how one would use the SDK with React and TypeScript. These patterns are pretty similar to conventions we follow in the Cloud Manager app.

```js
/** request.ts */

import { baseRequest } from 'linode-js-sdk/lib/request';

/**
 * intercepts every request with the following config
 * see https://github.com/axios/axios#interceptors for more documentation.
 */
baseRequest.interceptors.request.use(config => {
  const myToken = '1234';

  return {
    ...config,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${myToken}`
    }
  };
});
```

```js
/** LinodeList.tsx */

/**
 * The goal of this component is to create a list of all
 * your Linodes' labels
 */

import './request'
import { AxiosError } from 'axios'
import { getLinodes, Linode } from 'linode-js-sdk/lib/linodes'
import { APIError, ResourcePage } from 'linode-js-sdk/lib/types';
import React from 'react'

const MyComponent: React.FC<{}> = () => {
  const [linodes, setLinodesData] = React.useState<Linode[] | undefined>(undefined);
  const [errors, setErrors] = React.useState<APIError[] | undefined>(undefined);
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {

    /** set loading state while request is in flight */
    setLoading(true);

    getLinodes()
      .then((response: ResourcePage<Linode>) => {
        setLoading(false);
        setLinodesData(response.data)
      })
      .catch((e: AxiosError) => {
        setLoading(false);
        /**
         * All Linode error responses are wrapped in the Axios Error interface.
         * To override this and just return the Linode response, we recommend
         * looking into Axios interceptors:
         *
         * https://github.com/axios/axios#interceptors
         *
         * Need an example? Check out how we accomplish this in Cloud Manager:
         *
         * https://github.com/linode/manager/blob/develop/packages/manager/src/
         * request.tsx#L32
         */
        setErrors(e.response.data.errors)
      })
  }, [])

  if(loading) {
    return <div>Loading your Linodes...</div>
  }

  if(errors) {
    /**
     * you may need to do some additional undefined checking on
     * the AxiosError data
     */
    return <div>{errors[0].reason}</div>
  }

  if(!linodes) {
    return null;
  }

  return (
    <React.Fragment>
      {
        linodes.map(eachLinode => (
          <div key={eachLinode.id}>{eachLinode.label}</div>
        ))
      }
    </React.Fragment>
  )

}
```
