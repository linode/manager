import React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { useAllImagesQuery } from 'src/queries/images';

import { OSIcon } from '../OSIcon';
import { ImageOption } from './ImageOption';
import {
  getAPIFilterForImageSelect,
  getFilteredImagesForImageSelect,
} from './utilities';

import type { Image } from '@linode/api-v4';
import type { EnhancedAutocompleteProps } from 'src/components/Autocomplete/Autocomplete';

export type ImageSelectVariant = 'all' | 'private' | 'public';

interface Props
  extends Omit<
    Partial<EnhancedAutocompleteProps<Image>>,
    'onChange' | 'value'
  > {
  /**
   * Optional filter function applied to the options.
   */
  filter?: (image: Image) => boolean;
  /**
   * Set a custom select label
   */
  label?: string;
  /**
   * Called when the value is changed
   */
  onChange?: (image: Image | null) => void;
  /**
   * Set custom placeholder text
   */
  placeholder?: string;
  /**
   * If there is only one available option, selected it by default.
   */
  selectIfOnlyOneOption?: boolean;
  /**
   * The ID of the selected image
   */
  value: null | string | undefined;
  /**
   * Determines what images are fetched and shown
   * - Public - Includes all public Linux distributions
   * - Private - Includes images the customer captured or uploaded
   * - All - shows all images (no API filtering)
   */
  variant?: ImageSelectVariant;
}

export const ImageSelect = (props: Props) => {
  const {
    filter,
    label,
    onChange,
    placeholder,
    selectIfOnlyOneOption,
    variant,
    ...rest
  } = props;

  const { data: images, error, isLoading } = useAllImagesQuery(
    {},
    getAPIFilterForImageSelect(variant)
  );

  // We can't filter out Kubernetes images using the API so we filter them here
  const options = getFilteredImagesForImageSelect(images, variant);

  const filteredOptions = filter ? options?.filter(filter) : options;

  const value = images?.find((i) => i.id === props.value);

  if (
    filteredOptions?.length === 1 &&
    props.onChange &&
    selectIfOnlyOneOption
  ) {
    props.onChange(filteredOptions[0]);
  }

  return (
    <Autocomplete
      renderOption={(props, option, state) => (
        <ImageOption
          image={option}
          isSelected={state.selected}
          key={option.id}
          listItemProps={props}
        />
      )}
      textFieldProps={{
        InputProps: {
          startAdornment: value && (
            <OSIcon
              fontSize="24px"
              height="24px"
              os={value.vendor}
              pl={1}
              pr={2}
            />
          ),
        },
      }}
      clearOnBlur
      groupBy={(option) => option.vendor ?? 'My Images'}
      label={label || 'Images'}
      loading={isLoading}
      options={filteredOptions ?? []}
      placeholder={placeholder || 'Choose an image'}
      {...rest}
      disableClearable={
        rest.disableClearable ??
        (selectIfOnlyOneOption && filteredOptions?.length === 1)
      }
      onChange={(e, image) => {
        if (onChange) {
          onChange(image);
        }
      }}
      errorText={rest.errorText ?? error?.[0].reason}
      value={value ?? null}
    />
  );
};
