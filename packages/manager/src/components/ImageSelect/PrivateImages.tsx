import * as React from 'react';
import Select, { Item } from 'src/components/EnhancedSelect';
import SingleValue from 'src/components/EnhancedSelect/components/SingleValue';
import Grid from 'src/components/Grid';
import { getItemFromID } from 'src/utilities/getItemByID';

import { distroIcons } from './icons';
import ImageOption from './ImageOption';

interface Props {
  selectedImageID?: string;
  disabled: boolean;
  handleSelectImage: (selection?: string) => void;
  images: Linode.Image[];
  error?: string;
}

export const PrivateImages: React.FC<Props> = props => {
  const { disabled, error, images, handleSelectImage, selectedImageID } = props;
  const imageOptions = images.map(thisImage => ({
    label: thisImage.label,
    value: thisImage.id,
    className: thisImage.vendor
      ? `fl-${distroIcons[thisImage.vendor]}`
      : `fl-tux`
  }));

  const _handleSelect = (selected: Item<string>) => {
    if (selected === null) {
      handleSelectImage('');
    } else {
      handleSelectImage(selected.value);
    }
  };

  return (
    <Grid item xs={12}>
      <Select
        label="Image"
        disabled={disabled}
        errorText={error}
        placeholder="Select an Image"
        isClearable
        options={imageOptions}
        onChange={_handleSelect}
        value={
          imageOptions.length === 1
            ? imageOptions[0]
            : getItemFromID(imageOptions, selectedImageID)
        }
        components={{ Option: ImageOption, SingleValue }}
      />
    </Grid>
  );
};

export default PrivateImages;
