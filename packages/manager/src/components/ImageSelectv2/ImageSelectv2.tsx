import React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { useAllImagesQuery } from 'src/queries/images';

import { DistributionIcon } from '../DistributionIcon';
import { ImageOptionv2 } from './ImageOptionv2';
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
   * Called when the value is changed
   */
  onChange?: (image: Image | null) => void;
  /**
   * If there is only one avaiblable option, selected it by default.
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

export const ImageSelectv2 = (props: Props) => {
  const { filter, onChange, selectIfOnlyOneOption, variant, ...rest } = props;

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
        <ImageOptionv2
          image={option}
          isSelected={state.selected}
          key={option.id}
          listItemProps={props}
        />
      )}
      textFieldProps={{
        InputProps: {
          startAdornment: value && (
            <DistributionIcon
              distribution={value.vendor}
              fontSize="24px"
              height="24px"
              pl={1}
              pr={2}
            />
          ),
        },
      }}
      clearOnBlur
      groupBy={(option) => option.vendor ?? 'My Images'}
      label="Images"
      loading={isLoading}
      options={filteredOptions ?? []}
      placeholder="Choose an image"
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
