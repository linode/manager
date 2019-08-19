import { groupBy, uniq } from 'ramda';
import * as React from 'react';

import Select, { Item } from 'src/components/EnhancedSelect';
import SingleValue from 'src/components/EnhancedSelect/components/SingleValue';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
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

const getVendorFromImageID = (
  imageID: string | undefined,
  images: Linode.Image[]
) => {
  const image = images.find(thisImage => thisImage.id === imageID);
  return image ? image.vendor || '' : '';
};

export const sortByImageVersion = (a: Item<string>, b: Item<string>) => {
  /**
   * Images are labeled e.g. 'Debian 10', and we want newer versions
   * shown at the top of the options list.
   */
  try {
    const versionA = Number(a.label.split(' ')[1]);
    const versionB = Number(b.label.split(' ')[1]);

    if (isNaN(versionA) || isNaN(versionB)) {
      throw new Error('No version number found');
    }

    if (versionA > versionB) {
      return -1;
    }
    if (versionA < versionB) {
      return 1;
    }
    return 0;
  } catch {
    // If we can't find a version number, sort alphabetically by label
    if (a.label < b.label) {
      return -1;
    }
    if (a.label > b.label) {
      return 1;
    }
    return 0;
  }
};

export const PublicImages: React.FC<Props> = props => {
  const { disabled, error, handleSelectImage, images, selectedImageID } = props;
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

  const handleSelectVendor = (_selected: Item<string> | null) => {
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

  const _handleSelectImage = (_selected: Item<string> | null) => {
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

  const groupedImages = groupBy((eachImage: Linode.Image) => {
    return eachImage.vendor || 'No Vendor';
  }, images);

  const imageOptions = groupedImages[selectedVendor]
    ? groupedImages[selectedVendor]
        .map(thisImage => ({
          value: thisImage.id,
          label: thisImage.label
        }))
        .sort(sortByImageVersion)
    : [];

  return (
    <Grid container item direction="column">
      <Grid item>
        {error && (
          <Notice spacingTop={8} spacingBottom={0} error text={error} />
        )}
      </Grid>
      <Grid container item direction="row">
        <Grid item xs={6}>
          <Select
            disabled={disabled}
            label="Distributions"
            placeholder="Distributions"
            options={vendors}
            onChange={handleSelectVendor}
            value={getItemFromID(vendors, selectedVendor)}
            components={{ Option: ImageOption, SingleValue }}
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
            />
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};

export default PublicImages;
