import { LongviewClient } from 'linode-js-sdk/lib/longview';
import * as React from 'react';
import { compose } from 'recompose';

import TextField from 'src/components/TextField';

interface Props {
  updateList: (list: Record<string, LongviewClient> | undefined) => void;
  originalList: Record<string, LongviewClient>;
}

type CombinedProps = Props;

const LongviewSearch: React.FC<CombinedProps> = props => {
  const { updateList, originalList } = props;
  const [query, setQuery] = React.useState<string>('');

  React.useEffect(() => {
    if (!query) {
      updateList(undefined);
    } else {
      const filteredList: Record<string, LongviewClient> = Object.keys(
        originalList
      ).reduce((acc, eachKey) => {
        const thisClient = originalList[eachKey];
        if (thisClient.label.match(new RegExp(query, 'gmi'))) {
          acc[eachKey] = thisClient;
        }

        return acc;
      }, {});

      updateList(filteredList);
    }
  }, [query]);

  return (
    <TextField
      placeholder="Filter by client name"
      onChange={e => setQuery(e.target.value)}
    />
  );
};

export default compose<CombinedProps, Props>(React.memo)(LongviewSearch);
