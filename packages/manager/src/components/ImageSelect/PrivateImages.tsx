import * as React from 'react';
import Select, { Item } from 'src/components/EnhancedSelect';
import SingleValue from 'src/components/EnhancedSelect/components/SingleValue';
import Grid from 'src/components/Grid';
import { getItemFromID } from 'src/utilities/getItemByID';

import { distroIcons } from './icons';
import ImageOption from './ImageOption';

interface Props {
  selectedImageID?: string;
  handleSelectImage: (selection: string | null) => void;
  images: Linode.Image[];
}

export const PrivateImages: React.FC<Props> = props => {
  const { images, handleSelectImage, selectedImageID } = props;
  const imageOptions = images.map(thisImage => ({
    label: thisImage.label,
    value: thisImage.id,
    className: thisImage.vendor
      ? `fl-${distroIcons[thisImage.vendor]}`
      : `fl-tux`
  }));

  return (
    <Grid item xs={12}>
      <Select
        label="Image"
        isClearable
        options={imageOptions}
        onChange={(selected: Item<string>) => handleSelectImage(selected.value)}
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
