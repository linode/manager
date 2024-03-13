import { Image } from '@linode/api-v4';
import React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { useAllImagesQuery } from 'src/queries/images';

import { ImageOptionv2 } from './ImageOptionv2';

import type { EnhancedAutocompleteProps } from 'src/components/Autocomplete/Autocomplete';

interface Props
  extends Omit<Partial<EnhancedAutocompleteProps<Image>>, 'value'> {
  /**
   * The ID of the selected image
   */
  value: null | string | undefined;
}

export const ImageSelectv2 = (props: Props) => {
  const { data: images, error, isLoading } = useAllImagesQuery(
    {},
    { '+order_by': 'label', is_public: true }
  );

  // We can't filter out Kubernetes images using the API so we filter them here.
  const options = images?.filter((image) => !image.id.includes('kube')) ?? [];

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
      errorText={error?.[0].reason}
      groupBy={(option) => option.vendor ?? 'Other'}
      label="Images"
      loading={isLoading}
      options={options}
      placeholder="Choose an Image"
      {...props}
      value={value}
    />
  );
};
