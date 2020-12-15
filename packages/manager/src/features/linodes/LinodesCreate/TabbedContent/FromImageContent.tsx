import * as React from 'react';
import { Link } from 'react-router-dom';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import ImageSelect from 'src/components/ImageSelect';
import Placeholder from 'src/components/Placeholder';
import { filterImagesByType } from 'src/store/image/image.helpers';
import ImageIcon from 'src/assets/icons/entityIcons/image.svg';
import {
  BasicFromContentProps,
  ReduxStateProps,
  WithTypesRegionsAndImages
} from '../types';

const useStyles = makeStyles((theme: Theme) => ({
  main: {
    [theme.breakpoints.up('md')]: {
      maxWidth: '100%'
    }
  }
}));

interface Props extends BasicFromContentProps {
  variant?: 'public' | 'private' | 'all';
  imagePanelTitle?: string;
  error?: string;
}

export type CombinedProps = Props &
  BasicFromContentProps &
  ReduxStateProps &
  WithTypesRegionsAndImages;

export const FromImageContent: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const {
    error,
    imagePanelTitle,
    imagesData,
    userCannotCreateLinode,
    variant
  } = props;

  const privateImages = filterImagesByType(imagesData, 'private');

  if (variant === 'private' && Object.keys(privateImages).length === 0) {
    return (
      <Grid item className={`${classes.main} mlMain py0`}>
        <Paper>
          <Placeholder title="My Images" icon={ImageIcon} isEntity>
            <Typography variant="subtitle1">
              You don&#39;t have any private Images. Visit the{' '}
              <Link to="/images">Images section</Link> to create an Image from
              one of your Linode&#39;s disks.
            </Typography>
          </Placeholder>
        </Paper>
      </Grid>
    );
  }

  return (
    <Grid item className={`${classes.main} mlMain py0`}>
      <ImageSelect
        title={imagePanelTitle || 'Choose an Image'}
        images={Object.keys(imagesData).map(eachKey => imagesData[eachKey])}
        handleSelectImage={props.updateImageID}
        selectedImageID={props.selectedImageID}
        error={error}
        variant={variant}
        disabled={userCannotCreateLinode}
        data-qa-select-image-panel
      />
    </Grid>
  );
};

export default FromImageContent;
