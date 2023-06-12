import * as React from 'react';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import { useProfile } from 'src/queries/profile';
import { updateTagsSuggestionsData, useTagSuggestions } from 'src/queries/tags';
import { useQueryClient } from 'react-query';
import { styled } from '@mui/material/styles';
import { isPropValid } from 'src/utilities/isPropValid';

interface AddTagProps {
  label?: string;
  tags: string[];
  onClose?: () => void;
  addTag: (tag: string) => Promise<void>;
  fixedMenu?: boolean;
  inDetailsContext?: boolean;
}

const AddTag = (props: AddTagProps) => {
  const { addTag, label, onClose, tags, fixedMenu } = props;

  const queryClient = useQueryClient();
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
            updateTagsSuggestionsData([...accountTags, newTag], queryClient);
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
    <StyledSelect
      small
      escapeClearsValue
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

export { AddTag };

const StyledSelect = styled(Select, {
  shouldForwardProp: (prop) =>
    isPropValid(['fixedMenu', 'inDetailsContext'], prop),
})<{
  fixedMenu?: boolean;
  inDetailsContext?: boolean;
}>(({ ...props }) => ({
  width: '100%',
  padding: '0px',
  ...(props.fixedMenu && {
    '& .react-select__menu': {
      margin: '2px 0 0 0',
    },
  }),
  ...(props.inDetailsContext && {
    width: '415px',
    flexBasis: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
  }),
}));
