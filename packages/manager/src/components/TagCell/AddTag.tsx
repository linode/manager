import { getTags } from '@linode/api-v4/lib/tags';
import * as React from 'react';
import Select, { Item } from 'src/components/EnhancedSelect/Select';

import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((_: Theme) => ({
  root: {
    width: '100%'
  }
}));

interface Props {
  tags: string[];
  onClose: () => void;
  addTag: (tag: string) => void;
}

export type CombinedProps = Props;

export const AddTag: React.FC<Props> = props => {
  const classes = useStyles();
  const { addTag, onClose, tags } = props;
  const [accountTags, setAccountTags] = React.useState<Item<string>[]>([]);
  React.useEffect(() => {
    getTags()
      .then(response =>
        response.data.map(thisTag => ({
          value: thisTag.label,
          label: thisTag.label
        }))
      )
      .then(tags => setAccountTags(tags))
      // @todo should we toast for this? If we swallow the error the only
      // thing we lose is preexisting tabs as options; the add tag flow
      // should still work.
      .catch(_ => null);
  }, []);

  const tagOptions = accountTags.filter(
    thisTag => !tags.includes(thisTag.value)
  );

  const handleAddTag = (newTag: Item<string>) => {
    addTag(newTag.value);
    onClose();
  };
  return (
    <Select
      className={classes.root}
      onChange={handleAddTag}
      options={tagOptions}
      variant="creatable"
      onBlur={onClose}
      placeholder="Create or Select a Tag"
      label="Create or Select a Tag"
      hideLabel
      createOptionPosition="first"
      blurInputOnSelect={true}
    />
  );
};

export default AddTag;
