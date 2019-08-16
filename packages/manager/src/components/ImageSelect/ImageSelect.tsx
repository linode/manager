import { groupBy, uniq } from 'ramda';
import * as React from 'react';

import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Select, { Item } from 'src/components/EnhancedSelect';
import Grid from 'src/components/Grid';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(3)
  }
}));

interface Props {
  title: string;
  selectedImageID?: string;
  variant: 'public' | 'private';
  images: Linode.Image[];
  error?: string;
  handleSelectImage: (selection: any) => void;
}

const getItemFromID = (items: Item<string>[], id?: string) => {
  return items.find(thisItem => thisItem.value === id);
};

export const ImageSelect: React.FC<Props> = props => {
  const { handleSelectImage, images, selectedImageID, title } = props;
  const classes = useStyles();
  const [selectedVendor, setSelectedVendor] = React.useState<string>('');

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
  }, images);

  const vendors = uniq(
    images.map(thisImage => ({
      value: thisImage.vendor || 'None',
      label: thisImage.vendor || 'No Vendor'
    }))
  );
  const imageOptions = groupedImages[selectedVendor]
    ? groupedImages[selectedVendor].map(thisImage => ({
        value: thisImage.id,
        label: thisImage.label
      }))
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
            />
          </Grid>
          {Boolean(selectedVendor) && (
            <Grid item xs={6}>
              <Select
                label="Version"
                options={imageOptions}
                onChange={_handleSelectImage}
                value={getItemFromID(imageOptions, selectedImageID)}
              />
            </Grid>
          )}
        </Grid>
      </Paper>
    </>
  );
};

export default ImageSelect;
