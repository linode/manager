import { getTags } from '@linode/api-v4/lib/tags';
import * as React from 'react';
import Select, { Item } from 'src/components/EnhancedSelect/Select';

import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({}));

interface Props {
  tags: string[];
  onClose: () => void;
}

export type CombinedProps = Props;

export const AddTag: React.FC<Props> = props => {
  const { onClose, tags } = props;
  const [accountTags, setAccountTags] = React.useState<Item<string>[]>([]);
  const [tagInputValue, setTagInputValue] = React.useState<string>('');
  React.useEffect(() => {
    getTags()
      .then(response =>
        response.data.map(thisTag => ({
          value: thisTag.label,
          label: thisTag.label
        }))
      )
      .then(tags => setAccountTags(tags));
  }, []);
  return (
    <Select
      onChange={(input: string) => setTagInputValue(input)}
      options={accountTags}
      variant="creatable"
      onBlur={onClose}
      placeholder="Create or Select a Tag"
      label="Create or Select a Tag"
      hideLabel
      value={tagInputValue}
      createOptionPosition="first"
      autoFocus
      blurInputOnSelect={false}
    />
  );
};

export default AddTag;
