import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

import { useProfile } from 'src/queries/profile/profile';
import { updateTagsSuggestionsData, useTagSuggestions } from 'src/queries/tags';

import { Autocomplete } from '../Autocomplete/Autocomplete';

interface AddTagProps {
  addTag: (tag: string) => Promise<void>;
  existingTags: string[];
  onClose?: () => void;
}

export const AddTag = (props: AddTagProps) => {
  const { addTag, existingTags, onClose } = props;

  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const {
    data: accountTags,
    isFetching: accountTagsLoading,
  } = useTagSuggestions(!profile?.restricted);
  // @todo should we toast for this? If we swallow the error the only
  // thing we lose is preexisting tabs as options; the add tag flow
  // should still work.

  const [inputValue, setInputValue] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const createTag =
    !!accountTags &&
    !!inputValue &&
    !accountTags.some(
      (tag) => tag.label.toLowerCase() == inputValue.toLowerCase()
    );

  const tagOptions: { displayLabel?: string; label: string }[] = [
    ...(createTag
      ? [{ displayLabel: `Create "${inputValue}"`, label: inputValue }]
      : []),
    ...(accountTags?.filter((tag) => !existingTags.includes(tag.label)) ?? []),
  ];

  const handleAddTag = (newTag: string) => {
    setLoading(true);
    addTag(newTag)
      .then(() => {
        if (accountTags) {
          updateTagsSuggestionsData(
            [...accountTags, { label: newTag }],
            queryClient
          );
        }
      })
      .finally(() => {
        setLoading(false);
        if (onClose) {
          onClose();
        }
      });
  };

  return (
    <Autocomplete
      onBlur={() => {
        if (onClose) {
          onClose();
        }
      }}
      onChange={(_, value) => {
        if (value) {
          handleAddTag(typeof value == 'string' ? value : value.label);
        }
      }}
      renderOption={(props, option) => (
        <li {...props}>{option.displayLabel ?? option.label}</li>
      )}
      disableClearable
      forcePopupIcon
      label={'Create or Select a Tag'}
      loading={accountTagsLoading || loading}
      noOptionsText={<i>{`"${inputValue}" already added`}</i>} // Will display create option unless that tag is already added
      onInputChange={(_, value) => setInputValue(value)}
      openOnFocus
      options={tagOptions ?? []}
      placeholder="Create or Select a Tag"
      sx={{ width: '100%' }}
      textFieldProps={{ autoFocus: true, hideLabel: true }}
    />
  );
};
