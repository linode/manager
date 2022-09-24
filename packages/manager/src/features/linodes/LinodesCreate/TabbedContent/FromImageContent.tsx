import * as React from 'react';
import { Link } from 'react-router-dom';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import ImageSelect from 'src/components/ImageSelect';
import Placeholder from 'src/components/Placeholder';
import TextField from 'src/components/TextField';
import { filterImagesByType } from 'src/store/image/image.helpers';
import ImageIcon from 'src/assets/icons/entityIcons/image.svg';
import {
  BasicFromContentProps,
  ReduxStateProps,
  WithTypesRegionsAndImages,
} from '../types';

const useStyles = makeStyles((theme: Theme) => ({
  main: {
    [theme.breakpoints.up('md')]: {
      display: 'flex',
      justifyContent: 'space-between',
    },
  },
  sub: {
    width: '100%',
    maxWidth: '50%',
  },
  testTextField: {
    marginTop: '37px',
  },
}));

interface Props extends BasicFromContentProps {
  variant?: 'public' | 'private' | 'all';
  imagePanelTitle?: string;
  error?: string;
  testTextLabel?: string;
}

export type CombinedProps = Props &
  BasicFromContentProps &
  ReduxStateProps &
  WithTypesRegionsAndImages;

export const FromImageContent: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const {
    error,
    imagePanelTitle,
    imagesData,
    userCannotCreateLinode,
    variant,
    testTextLabel,
  } = props;

  const privateImages = filterImagesByType(imagesData, 'private');

  if (variant === 'private' && Object.keys(privateImages).length === 0) {
    return (
      <Grid item className={`${classes.main} mlMain py0`}>
        <Paper>
          <Placeholder title="My Images" icon={ImageIcon} isEntity>
            <Typography variant="subtitle1">
              You don&rsquo;t have any private Images. Visit the{' '}
              <Link to="/images">Images section</Link> to create an Image from
              one of your Linode&rsquo;s disks.
            </Typography>
          </Placeholder>
        </Paper>
      </Grid>
    );
  }

  return (
    <Paper>
      <Grid container spacing={1} className={`${classes.main} mlMain py0`}>
        <Grid item className={`${classes.sub} py0 px0`}>
          <ImageSelect
            title={imagePanelTitle || 'Choose an Image'}
            images={Object.keys(imagesData).map(
              (eachKey) => imagesData[eachKey]
            )}
            handleSelectImage={props.updateImageID}
            selectedImageID={props.selectedImageID}
            error={error}
            variant={variant}
            disabled={userCannotCreateLinode}
            data-qa-select-image-panel
          />
        </Grid>
        <Grid item className={`${classes.sub} ${classes.testTextField}`}>
          <TextField
            label={testTextLabel || 'Testing'}
            placeholder="This is a placeholder"
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default FromImageContent;
