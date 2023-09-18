import * as React from 'react';
import { Link } from 'react-router-dom';

import ImageIcon from 'src/assets/icons/entityIcons/image.svg';
import { ImageSelect } from 'src/components/ImageSelect/ImageSelect';
import { Paper } from 'src/components/Paper';
import { Placeholder } from 'src/components/Placeholder/Placeholder';
import { Typography } from 'src/components/Typography';
import { filterImagesByType } from 'src/store/image/image.helpers';

import {
  BasicFromContentProps,
  ReduxStateProps,
  WithTypesRegionsAndImages,
} from '../types';
import { StyledGrid } from './CommonTabbedContent.styles';

interface Props extends BasicFromContentProps {
  error?: string;
  imagePanelTitle?: string;
  variant?: 'all' | 'private' | 'public';
}

export type CombinedProps = Props &
  BasicFromContentProps &
  ReduxStateProps &
  WithTypesRegionsAndImages;

export const FromImageContent = (props: CombinedProps) => {
  const {
    error,
    imagePanelTitle,
    imagesData,
    userCannotCreateLinode,
    variant,
  } = props;

  const privateImages = filterImagesByType(imagesData, 'private');

  if (variant === 'private' && Object.keys(privateImages).length === 0) {
    return (
      <StyledGrid>
        <Paper>
          <Placeholder icon={ImageIcon} isEntity title="My Images">
            <Typography variant="subtitle1">
              You don&rsquo;t have any private Images. Visit the{' '}
              <Link to="/images">Images section</Link> to create an Image from
              one of your Linode&rsquo;s disks.
            </Typography>
          </Placeholder>
        </Paper>
      </StyledGrid>
    );
  }

  return (
    <StyledGrid>
      <ImageSelect
        data-qa-select-image-panel
        disabled={userCannotCreateLinode}
        error={error}
        handleSelectImage={props.updateImageID}
        images={Object.keys(imagesData).map((eachKey) => imagesData[eachKey])}
        selectedImageID={props.selectedImageID}
        title={imagePanelTitle || 'Choose an Image'}
        variant={variant}
      />
    </StyledGrid>
  );
};
