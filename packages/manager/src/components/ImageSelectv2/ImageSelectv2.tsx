import React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { useAllImagesQuery } from 'src/queries/images';

import { ImageOptionv2 } from './ImageOptionv2';
import {
  getAPIFilterForImageSelect,
  getFilteredImagesForImageSelect,
} from './utilities';

import type { Image } from '@linode/api-v4';
import type { EnhancedAutocompleteProps } from 'src/components/Autocomplete/Autocomplete';

export type ImageSelectVariant = 'all' | 'private' | 'public';

interface Props
  extends Omit<Partial<EnhancedAutocompleteProps<Image>>, 'value'> {
  /**
   * Optional filter function applied to the options.
   */
  filter?: (image: Image) => boolean;
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
  const { filter, variant, ...rest } = props;

  const { data: images, error, isLoading } = useAllImagesQuery(
    {},
    getAPIFilterForImageSelect(variant)
  );

  // We can't filter out Kubernetes images using the API so we filter them here
  const options = getFilteredImagesForImageSelect(images, variant);

  const filteredOptions = filter ? options?.filter(filter) : options;

  const value = images?.find((i) => i.id === props.value);

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
      groupBy={(option) => option.vendor ?? 'My Images'}
      label="Images"
      loading={isLoading}
      options={filteredOptions ?? []}
      placeholder="Choose an image"
      {...rest}
      errorText={rest.errorText ?? error?.[0].reason}
      value={value ?? null}
    />
  );
};
