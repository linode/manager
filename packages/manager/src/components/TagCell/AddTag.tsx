import { getTags } from '@linode/api-v4/lib/tags';
import * as React from 'react';
import * as classNames from 'classnames';
import Select, { Item } from 'src/components/EnhancedSelect/Select';

import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((_: Theme) => ({
  root: {
    width: '100%',
    padding: '0px'
  },
  hasFixedMenu: {
    '& .react-select__menu': {
      margin: '2px 0 0 0'
    }
  },
  inDetailsContext: {
    width: '415px',
    flexBasis: '100%',
    display: 'flex',
    justifyContent: 'flex-end'
  }
}));

interface Props {
  label?: string;
  tags: string[];
  onClose?: () => void;
  addTag: (tag: string) => void;
  fixedMenu?: boolean;
  inDetailsContext?: boolean;
}

export type CombinedProps = Props;

export const AddTag: React.FC<Props> = props => {
  const classes = useStyles();
  const { addTag, label, onClose, tags, fixedMenu, inDetailsContext } = props;
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
    if (newTag?.value) {
      addTag(newTag.value);
    }

    if (onClose) {
      onClose();
    }
  };

  return (
    <Select
      small
      escapeClearsValue
      className={classNames({
        [classes.root]: true,
        [classes.hasFixedMenu]: fixedMenu,
        [classes.inDetailsContext]: inDetailsContext
      })}
      onChange={handleAddTag}
      options={tagOptions}
      variant="creatable"
      value={null}
      onBlur={onClose}
      placeholder="Create or Select a Tag"
      label={label ?? 'Add a tag'}
      hideLabel={!label}
      // eslint-disable-next-line
      autoFocus
      createOptionPosition="first"
      blurInputOnSelect={true}
      menuPosition={fixedMenu ? 'fixed' : 'absolute'}
    />
  );
};

export default AddTag;
