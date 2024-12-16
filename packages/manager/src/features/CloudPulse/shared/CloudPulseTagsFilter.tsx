import { Autocomplete } from '@linode/ui';
import React from 'react';

import { useTagsQuery } from 'src/queries/cloudpulse/tags';
import { themes } from 'src/utilities/theme';

import type { FilterValue } from '@linode/api-v4';

export interface CloudPulseTags {
  label: string;
}

export interface CloudPulseTagsSelectProps {
  defaultValue?: Partial<FilterValue>;
  disabled?: boolean;
  handleTagsChange: (tags: CloudPulseTags[], savePref?: boolean) => void;
  label: string;
  placeholder?: string;
  resourceType: string | undefined;
  savePreferences?: boolean;
}

export const CloudPulseTagsSelect = React.memo(
  (props: CloudPulseTagsSelectProps) => {
    const {
      defaultValue,
      disabled,
      handleTagsChange,
      label,
      placeholder,
      resourceType,
      savePreferences,
    } = props;

    const { data: tags, isError, isLoading } = useTagsQuery(
      disabled !== undefined ? !disabled : Boolean(resourceType),
      resourceType,
      {}
    );

    const [selectedTags, setSelectedTags] = React.useState<CloudPulseTags[]>();

    const isAutocompleteOpen = React.useRef(false); // Ref to track the open state of Autocomplete

    React.useEffect(() => {
      if (tags && savePreferences && !selectedTags) {
        const defaultTags =
          defaultValue && Array.isArray(defaultValue)
            ? defaultValue.map((tag) => String(tag))
            : [];
        const tag = tags.filter((tag) =>
          defaultTags.includes(String(tag.label))
        );

        handleTagsChange(tag);
        setSelectedTags(tag);
      } else {
        if (selectedTags) {
          setSelectedTags([]);
        }
        handleTagsChange([]);
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tags, resourceType]);

    return (
      <Autocomplete
        onChange={(e, tagSelections) => {
          setSelectedTags(tagSelections);

          if (!isAutocompleteOpen.current) {
            handleTagsChange(tagSelections, savePreferences);
          }
        }}
        onClose={() => {
          isAutocompleteOpen.current = false;
          handleTagsChange(selectedTags ?? [], savePreferences);
        }}
        onOpen={() => {
          isAutocompleteOpen.current = true;
        }}
        textFieldProps={{
          InputProps: {
            sx: {
              '::-webkit-scrollbar': {
                display: 'none',
              },
              maxHeight: '55px',
              msOverflowStyle: 'none',
              overflow: 'auto',
              scrollbarWidth: 'none',
              svg: {
                color: themes.light.color.grey3,
              },
            },
          },
          optional: true,
        }}
        autoHighlight
        clearOnBlur
        data-testid="tags-select"
        disabled={!resourceType}
        errorText={isError ? `Failed to fetch ${label || 'Tags'}.` : ''}
        label={label || 'Tags'}
        limitTags={1}
        loading={isLoading}
        multiple
        noMarginTop
        options={tags ?? []}
        placeholder={selectedTags?.length ? '' : placeholder || 'Select Tags'}
        value={selectedTags ?? []}
      />
    );
  },
  (prevProps, nextProps) => prevProps.resourceType === nextProps.resourceType
);
