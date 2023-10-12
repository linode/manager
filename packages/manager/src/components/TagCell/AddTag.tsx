import { styled } from '@mui/material/styles';
import * as React from 'react';
import { useQueryClient } from 'react-query';

import Select, { Item } from 'src/components/EnhancedSelect/Select';
import { useProfile } from 'src/queries/profile';
import { updateTagsSuggestionsData, useTagSuggestions } from 'src/queries/tags';
import { omittedProps } from 'src/utilities/omittedProps';

interface AddTagProps {
  addTag: (tag: string) => Promise<void>;
  fixedMenu?: boolean;
  inDetailsContext?: boolean;
  label?: string;
  onClose?: () => void;
  tags: string[];
}

const AddTag = (props: AddTagProps) => {
  const { addTag, fixedMenu, label, onClose, tags } = props;

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
    .map((tag) => ({ label: tag.label, value: tag.label }));

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
      // eslint-disable-next-line
      autoFocus
      creatable
      createOptionPosition="first"
      escapeClearsValue
      hideLabel={!label}
      isLoading={loading}
      label={label ?? 'Add a tag'}
      menuPosition={fixedMenu ? 'fixed' : 'absolute'}
      onBlur={onClose}
      onChange={handleAddTag}
      options={tagOptions}
      placeholder="Create or Select a Tag"
      small
    />
  );
};

export { AddTag };

const StyledSelect = styled(Select, {
  shouldForwardProp: (prop) =>
    omittedProps(['fixedMenu', 'inDetailsContext'], prop),
})<{
  fixedMenu?: boolean;
  inDetailsContext?: boolean;
}>(({ ...props }) => ({
  padding: '0px',
  width: '100%',
  ...(props.fixedMenu && {
    '& .react-select__menu': {
      margin: '2px 0 0 0',
    },
  }),
  ...(props.inDetailsContext && {
    display: 'flex',
    flexBasis: '100%',
    justifyContent: 'flex-end',
    width: '415px',
  }),
}));
