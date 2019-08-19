import { groupBy, uniq } from 'ramda';
import * as React from 'react';

import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Select, { Item } from 'src/components/EnhancedSelect';
import SingleValue from 'src/components/EnhancedSelect/components/SingleValue';
import Grid from 'src/components/Grid';

import { distroIcons } from './icons';
import ImageOption from './ImageOption';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(3)
  }
}));

interface Props {
  title: string;
  selectedImageID?: string;
  images: Linode.Image[];
  error?: string;
  handleSelectImage: (selection: any) => void;
}

const getItemFromID = (items: Item<string>[], id?: string) => {
  return items.find(thisItem => thisItem.value === id);
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

const getVendorFromImageID = (
  imageID: string | undefined,
  images: Linode.Image[]
) => {
  const image = images.find(thisImage => thisImage.id === imageID);
  return image ? image.vendor || '' : '';
};

export const ImageSelect: React.FC<Props> = props => {
  const { handleSelectImage, images, selectedImageID, title } = props;
  const classes = useStyles();
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

  // This component only works with public Images
  const publicImages = images.filter(thisImage => thisImage.is_public);

  const handleSelectVendor = (_selected: Item<string> | null) => {
    if (_selected === null) {
      handleSelectImage(null);
      return setSelectedVendor('');
    }
    setSelectedVendor(_selected.value);
  };

  const _handleSelectImage = (_selected: Item<string> | null) => {
    if (_selected === null) {
      return handleSelectImage('');
    }
    handleSelectImage(_selected.value);
  };

  const groupedImages = groupBy((eachImage: Linode.Image) => {
    return eachImage.vendor || 'No Vendor';
  }, publicImages);

  const vendors = uniq(
    publicImages.map(thisImage => ({
      value: thisImage.vendor || 'None',
      label: thisImage.vendor || 'No Vendor',
      // This is applied to the input display in the custom SingleValue component
      // (displays the icon when a vendor has been selected)
      className: thisImage.vendor
        ? `fl-${distroIcons[thisImage.vendor]}`
        : undefined
    }))
  );
  const imageOptions = groupedImages[selectedVendor]
    ? groupedImages[selectedVendor]
        .map(thisImage => ({
          value: thisImage.id,
          label: thisImage.label
        }))
        .sort(sortByImageVersion)
    : [];

  return (
    <>
      <Paper className={classes.root}>
        <Typography variant="h2" data-qa-tp={title}>
          {title}
        </Typography>
        <Grid container direction="row" wrap="nowrap" spacing={4}>
          <Grid item xs={6}>
            <Select
              label="Distributions"
              options={vendors}
              onChange={handleSelectVendor}
              value={getItemFromID(vendors, selectedVendor)}
              components={{ Option: ImageOption, SingleValue }}
            />
          </Grid>
          {Boolean(selectedVendor) && (
            <Grid item xs={6}>
              <Select
                label="Version"
                isClearable={imageOptions.length > 1}
                options={imageOptions}
                onChange={_handleSelectImage}
                value={
                  imageOptions.length === 1
                    ? imageOptions[0]
                    : getItemFromID(imageOptions, selectedImageID)
                }
              />
            </Grid>
          )}
        </Grid>
      </Paper>
    </>
  );
};

export default ImageSelect;
