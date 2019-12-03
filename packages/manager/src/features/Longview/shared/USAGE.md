# Shared Components

## TimeRangeSelect

The `<TimeRangeSelect />` component is meant to act as a compliment to
each line graph for the Longview feature. All Longview graphs will allow
the user to specify between what 2 timestamps they want to receive data for - the default being the past 30 minutes.

Furthermore, if you're a Longview Pro member, you get more options than a free user.

The `<TimeRangeSelect />` aims to simplify the developer experience here.

### Props

| Prop Name         | Type                                  | Description                                                                                                                                                      |
|-------------------|---------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| handleStatsChange | (start: number, end: number) => void; | Function that returns the start and end times in seconds - these values should be used when requesting values from the Longview API with the `getValues` action. |

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
  return (
    <TimeRangeSelect
      handleStatsChange={(start, end) => {
        get(props.clientAPIKey, 'getValues', {
          fields: ['cpu'],
          start,
          end
        })
          .then(r => r)
          .catch(e => e)
      }}
    />
  );
};

export default React.memo(Installation);
```