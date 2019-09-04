import { Image } from 'linode-js-sdk/lib/images';
import { groupBy, uniq } from 'ramda';
import * as React from 'react';

import Select, { Item } from 'src/components/EnhancedSelect';
import SingleValue from 'src/components/EnhancedSelect/components/SingleValue';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import { getItemFromID } from 'src/utilities/getItemByID';

import { distroIcons } from './icons';
import ImageOption from './ImageOption';
import { ImageProps as Props } from './ImageSelect';

const getVendorFromImageID = (imageID: string | undefined, images: Image[]) => {
  const image = images.find(thisImage => thisImage.id === imageID);
  return image ? image.vendor || '' : '';
};

interface ImageItem extends Item<string> {
  created: string;
}

export const sortByImageVersion = (a: ImageItem, b: ImageItem) => {
  if (a.created < b.created) {
    return 1;
  }
  if (a.created > b.created) {
    return -1;
  }
  return 0;
};

export const PublicImages: React.FC<Props> = props => {
  const {
    disabled,
    error,
    handleSelectImage,
    images,
    selectedImageID,
    ...reactSelectProps
  } = props;
  const [selectedVendor, setSelectedVendor] = React.useState<string>('');

  React.useEffect(() => {
    /**
     * If an image is selected (for example we usually pre-select Debian 9)
     * we set the selected image's vendor as the selected vendor. If there is no
     * selected image ID, we don't want to do this (for example when the user clears
     * the selected version manually, in which case we want to show a blank version select).
     */
    if (props.selectedImageID) {
      setSelectedVendor(
        getVendorFromImageID(props.selectedImageID, props.images)
      );
    }
  }, [images, selectedImageID]);

  const handleSelectVendor = (_selected: ImageItem | null) => {
    if (_selected === null) {
      handleSelectImage();
      setSelectedVendor('');
    } else {
      setSelectedVendor(_selected.value);
      const newOptions = images.filter(
        thisImage => thisImage.vendor === _selected.value
      );
      newOptions.length === 1
        ? handleSelectImage(newOptions[0].id)
        : handleSelectImage('');
    }
  };

  const _handleSelectImage = (_selected: ImageItem | null) => {
    if (_selected === null) {
      return handleSelectImage('');
    }
    handleSelectImage(_selected.value);
  };

  const vendors = uniq(
    images.map(thisImage => ({
      value: thisImage.vendor || 'None',
      label: thisImage.vendor || 'No Vendor',
      // This is applied to the input display in the custom SingleValue component
      // (displays the icon when a vendor has been selected)
      className: thisImage.vendor
        ? `fl-${distroIcons[thisImage.vendor]}`
        : undefined
    }))
  );

  const groupedImages = groupBy((eachImage: Image) => {
    return eachImage.vendor || 'No Vendor';
  }, images);

  const imageOptions = groupedImages[selectedVendor]
    ? groupedImages[selectedVendor]
        .map(thisImage => ({
          value: thisImage.id,
          label: thisImage.label,
          created: thisImage.created
        }))
        .sort(sortByImageVersion)
    : [];

  return (
    <Grid container item direction="column" style={{ paddingTop: 0 }}>
      <Grid item>
        {error && (
          <Notice spacingTop={8} spacingBottom={0} error text={error} />
        )}
      </Grid>
      <Grid container item direction="row" style={{ paddingTop: 0 }}>
        <Grid item xs={6}>
          <Select
            disabled={disabled}
            label="Distributions"
            placeholder="Choose a distribution"
            options={vendors}
            onChange={handleSelectVendor}
            value={getItemFromID(vendors, selectedVendor)}
            components={{ Option: ImageOption, SingleValue }}
            {...reactSelectProps}
          />
        </Grid>
        {Boolean(selectedVendor) && (
          <Grid item xs={6}>
            <Select
              disabled={disabled}
              label="Version"
              placeholder="Select a version"
              isClearable={imageOptions.length > 1}
              options={imageOptions}
              onChange={_handleSelectImage}
              value={getItemFromID(imageOptions, selectedImageID)}
              {...reactSelectProps}
            />
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};

export default PublicImages;
