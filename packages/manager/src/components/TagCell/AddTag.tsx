import classNames from 'classnames';
import * as React from 'react';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import { useProfile } from 'src/queries/profile';
import { updateTagsSuggestionsData, useTagSuggestions } from 'src/queries/tags';

const useStyles = makeStyles((_: Theme) => ({
  root: {
    width: '100%',
    padding: '0px',
  },
  hasFixedMenu: {
    '& .react-select__menu': {
      margin: '2px 0 0 0',
    },
  },
  inDetailsContext: {
    width: '415px',
    flexBasis: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
  },
}));

interface Props {
  label?: string;
  tags: string[];
  onClose?: () => void;
  addTag: (tag: string) => Promise<void>;
  fixedMenu?: boolean;
  inDetailsContext?: boolean;
}

export type CombinedProps = Props;

export const AddTag: React.FC<Props> = (props) => {
  const classes = useStyles();
  const { addTag, label, onClose, tags, fixedMenu, inDetailsContext } = props;

  const [isLoading, setIsLoading] = React.useState(false);
  const { data: profile } = useProfile();
  const {
    data: accountTags,
    isLoading: accountTagsLoading,
  } = useTagSuggestions(!profile?.restricted);
  // @todo should we toast for this? If we swallow the error the only
  // thing we lose is preexisting tabs as options; the add tag flow
  // should still work.

  const tagOptions = accountTags
    ?.filter((tag) => !tags.includes(tag.label))
    .map((tag) => ({ value: tag.label, label: tag.label }));

  const handleAddTag = (newTag: Item<string>) => {
    if (newTag?.value) {
      setIsLoading(true);
      addTag(newTag.value)
        .then(() => {
          if (accountTags) {
            updateTagsSuggestionsData([...accountTags, newTag]);
          }
          if (onClose) {
            onClose();
          }
        })
        .finally(() => setIsLoading(false));
    }
  };

  const loading = accountTagsLoading || isLoading;

  return (
    <Select
      small
      escapeClearsValue
      className={classNames({
        [classes.root]: true,
        [classes.hasFixedMenu]: fixedMenu,
        [classes.inDetailsContext]: inDetailsContext,
      })}
      onChange={handleAddTag}
      options={tagOptions}
      creatable
      onBlur={onClose}
      placeholder="Create or Select a Tag"
      label={label ?? 'Add a tag'}
      hideLabel={!label}
      // eslint-disable-next-line
      autoFocus
      createOptionPosition="first"
      menuPosition={fixedMenu ? 'fixed' : 'absolute'}
      isLoading={loading}
    />
  );
};

export default AddTag;
