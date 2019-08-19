import * as React from 'react';

import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';

import PrivateImages from './PrivateImages';
import PublicImages from './PublicImages';

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
  variant: any;
  handleSelectImage: (selection: string | null) => void;
}

export const ImageSelect: React.FC<Props> = props => {
  const { handleSelectImage, images, selectedImageID, title, variant } = props;
  const classes = useStyles();

  return (
    <>
      <Paper className={classes.root}>
        <Typography variant="h2" data-qa-tp={title}>
          {title}
        </Typography>
        <Grid container direction="row" wrap="nowrap" spacing={4}>
          {variant === 'public' ? (
            <PublicImages
              images={images.filter(thisImage => thisImage.is_public)}
              handleSelectImage={handleSelectImage}
              selectedImageID={selectedImageID}
            />
          ) : (
            <PrivateImages
              images={images.filter(thisImage => !thisImage.is_public)}
              handleSelectImage={handleSelectImage}
              selectedImageID={selectedImageID}
            />
          )}
        </Grid>
      </Paper>
    </>
  );
};

export default ImageSelect;
