import * as React from 'react';
import { Link } from 'react-router-dom';

import ImageIcon from 'src/assets/icons/entityIcons/image.svg';
import { ImageSelect } from 'src/components/ImageSelect/ImageSelect';
import { Paper } from 'src/components/Paper';
import { Placeholder } from 'src/components/Placeholder/Placeholder';
import { Typography } from 'src/components/Typography';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { filterImagesByType } from 'src/store/image/image.helpers';

import { StyledGrid } from './CommonTabbedContent.styles';

import type {
  BasicFromContentProps,
  ReduxStateProps,
  WithTypesRegionsAndImages,
} from '../types';
import type { Image } from '@linode/api-v4';

interface Props extends BasicFromContentProps {
  error?: string;
  imageLabel?: string;
  imagePanelTitle?: string;
  placeholder?: string;
  variant?: 'all' | 'private' | 'public';
}

export type CombinedProps = Props &
  BasicFromContentProps &
  ReduxStateProps &
  WithTypesRegionsAndImages;

export const FromImageContent = (props: CombinedProps) => {
  const {
    error,
    imageLabel,
    imagePanelTitle,
    imagesData,
    placeholder,
    userCannotCreateLinode,
    variant,
  } = props;

  const privateImages = filterImagesByType(imagesData, 'private');

  const { data: regions } = useRegionsQuery();

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

  const onChange = (image: Image | null) => {
    props.updateImageID(image?.id ?? '');

    const selectedRegion = regions?.find(
      (r) => r.id === props.selectedRegionID
    );

    // Non-"distributed compatible" Images must only be deployed to core sites.
    // Clear the region field if the currently selected region is a distributed site and the Image is only core compatible.
    if (
      image &&
      !image.capabilities.includes('distributed-sites') &&
      selectedRegion?.site_type === 'distributed'
    ) {
      props.updateRegionID('');
    }
  };

  return (
    <StyledGrid>
      <ImageSelect
        data-qa-select-image-panel
        disabled={userCannotCreateLinode}
        error={error}
        handleSelectImage={(_, image) => onChange(image ?? null)}
        images={Object.keys(imagesData).map((eachKey) => imagesData[eachKey])}
        label={imageLabel}
        placeholder={placeholder}
        selectedImageID={props.selectedImageID}
        title={imagePanelTitle || 'Choose an Image'}
        variant={variant}
      />
    </StyledGrid>
  );
};
