import { Image } from 'linode-js-sdk/lib/images';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { BaseSelectProps } from 'src/components/EnhancedSelect/Select';

import Grid from 'src/components/Grid';

import PrivateImages from './PrivateImages';
import PublicImages from './PublicImages';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(3)
  }
}));

export type Variant = 'public' | 'private' | 'all';
interface Props {
  title: string;
  selectedImageID?: string;
  images: Image[];
  error?: string;
  variant?: Variant;
  disabled?: boolean;
  handleSelectImage: (selection?: string) => void;
}

export interface ImageProps
  extends Omit<BaseSelectProps, 'onChange' | 'variant'> {
  selectedImageID?: string;
  disabled: boolean;
  handleSelectImage: (selection?: string) => void;
  images: Image[];
  error?: string;
}

export const ImageSelect: React.FC<Props> = props => {
  const {
    disabled,
    error,
    handleSelectImage,
    images,
    selectedImageID,
    title,
    variant
  } = props;
  const classes = useStyles();

  const renderVariant = () => {
    switch (variant) {
      case 'all':
      case 'private':
        return (
          <PrivateImages
            error={error}
            images={images.filter(thisImage => !thisImage.is_public)}
            disabled={Boolean(disabled)}
            handleSelectImage={handleSelectImage}
            selectedImageID={selectedImageID}
          />
        )
      case 'public':
      default:
        return (
          <PublicImages
            images={images.filter(thisImage => thisImage.is_public)}
            disabled={Boolean(disabled)}
            handleSelectImage={handleSelectImage}
            selectedImageID={selectedImageID}
            error={error}
          />
        )
    }
  }

  return (
    <>
      <Paper className={classes.root} data-qa-select-image-panel>
        <Typography variant="h2" data-qa-tp={title}>
          {title}
        </Typography>
        <Grid container direction="row" wrap="nowrap" spacing={4}>
          {renderVariant()}
        </Grid>
      </Paper>
    </>
  );
};

export default ImageSelect;
