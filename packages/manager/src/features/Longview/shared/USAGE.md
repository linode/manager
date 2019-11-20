# Shared Components

## TimeRangeSelect

The `<TimeRangeSelect />` component is meant to act as a wrapper around
each line graph for the Longview feature. All Longview graphs will allow
the user to specify between what 2 timestamps they want to recieve data for - the default being the past 30 minutes.

Furthermore, if you're a Longview Pro member, you get more options than a free user.

The `<TimeRangeSelect />` aims to simplify the developer experience here.

### Props

| Prop Name   | Type                                                       | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
|-------------|------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| lastUpdated | number                                                     | The datetime that is returned from the  ``` curl    --request POST \,   --url https://longview.linode.com/fetch \,   --header 'content-type: multipart/form-data; boundary=---011000010111000001101001' \,   --form api_key=KEY \,   --form api_action=batch \,   --form 'api_requestArray=[{ "api_action": "lastUpdated" }]' \, ```  request. The parent of this component should be polling for `lastUpdated` time on an interval so that the Select component keeps updating the stats |
| requets     | (start: number, end: number) => Promise<Partial<SomeStat>> | The actual async request to be triggered each time the `lastUpdated` key is updated. This should return some partial data from the Longview API                                                                                                                                                                                                                                                                                                                                           |
| children    | (stats: SomeStat, error: APIError[]) => JSX.Element        | What JSX you want to render. This component exposes both the resolved data and any caught errors. It's the consumers responsibility to decide when it wants to display errors, if any.  The resolved data will default to an empty object ({})                                                                                                                                                                                                                                            |

### Usage

Ideally in your parent, you'll have an interval set up to poll for `lastUpdated` time - the datetime that the Longview data has been updated for the client currently being viewed.

You can also add typing to the actual `<TimeRangeSelect />` component itself.

Here's an example:

```js
import * as React from 'react';
import TimeRangeSelect from '../../shared/TimeRangeSelect';
import get from '../../request';
import { LongviewCPU } from '../../request.types';

interface Props {
  clientAPIKey: string;
}

type CombinedProps = Props;

const Installation: React.FC<CombinedProps> = props => {
  const [lastUpdated, setLastUpdated] = React.useState<number>(0);

  let timeout: NodeJS.Timeout;

  React.useEffect(() => {
    /*
      request lastUpdated every 2 seconds
    */
    timeout = setInterval(() => {
      getLastUpdated()
        .then(setLastUpdated)
        .catch(e => e)
    }, 2000)

    return () => {
      clearInterval(timeout)
    }
  }, [])

  return (
    <TimeRangeSelect<LongviewCPU>
      lastUpdated={lastUpdated}
      request={(start, end) =>
        get(props.clientAPIKey, 'getValues', {
          fields: ['cpu'],
          start,
          end
        })
      }
    >
      {stats => {
        console.log(stats)
        return <div>hello world</div>;
      }}
    </TimeRangeSelect>
  );
};

export default React.memo(Installation);
```