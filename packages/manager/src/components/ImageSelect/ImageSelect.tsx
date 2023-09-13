import { Image } from '@linode/api-v4/lib/images';
import Grid from '@mui/material/Unstable_Grid2';
import produce from 'immer';
import { DateTime } from 'luxon';
import { equals, groupBy } from 'ramda';
import * as React from 'react';

import Select, { GroupType, Item } from 'src/components/EnhancedSelect';
import { BaseSelectProps } from 'src/components/EnhancedSelect/Select';
import { _SingleValue } from 'src/components/EnhancedSelect/components/SingleValue';
import { ImageOption } from 'src/components/ImageSelect/ImageOption';
import { Typography } from 'src/components/Typography';
import { Paper } from 'src/components/Paper';
import { MAX_MONTHS_EOL_FILTER } from 'src/constants';
import { useAllImagesQuery } from 'src/queries/images';
import { arePropsEqual } from 'src/utilities/arePropsEqual';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getSelectedOptionFromGroupedOptions from 'src/utilities/getSelectedOptionFromGroupedOptions';

import { distroIcons } from './icons';

export type Variant = 'all' | 'private' | 'public';

interface ImageItem extends Item<string> {
  className: string;
  created: string;
  isCloudInitCompatible: boolean;
}

interface ImageSelectProps {
  classNames?: string;
  disabled?: boolean;
  error?: string;
  handleSelectImage: (selection?: string) => void;
  images: Image[];
  selectedImageID?: string;
  title: string;
  variant?: Variant;
}

export interface ImageProps
  extends Omit<BaseSelectProps<ImageItem>, 'onChange' | 'variant'> {
  disabled: boolean;
  error?: string;
  handleSelectImage: (selection?: string) => void;
  images: Image[];
  selectedImageID?: string;
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

export const sortGroupsWithMyImagesAtTheBeginning = (a: string, b: string) => {
  if (a === 'My Images') {
    return -1;
  }
  if (b === 'My Images') {
    return 1;
  }
  if (a > b) {
    return 1;
  }
  if (a < b) {
    return -1;
  }
  return 0;
};

export const imagesToGroupedItems = (images: Image[]) => {
  const groupedImages = groupBy((eachImage: Image) => {
    return eachImage.vendor || 'My Images';
  }, images);

  return Object.keys(groupedImages)
    .sort(sortGroupsWithMyImagesAtTheBeginning)
    .reduce((accum: GroupType<string>[], thisGroup) => {
      const group = groupedImages[thisGroup];
      if (!group || group.length === 0) {
        return accum;
      }
      return produce(accum, (draft) => {
        draft.push({
          label: thisGroup,
          options: group
            .reduce((acc: ImageItem[], thisImage) => {
              const {
                capabilities,
                created,
                eol,
                id,
                label,
                vendor,
              } = thisImage;
              const differenceInMonths = DateTime.now().diff(
                DateTime.fromISO(eol!),
                'months'
              ).months;
              // if image is past its end of life, hide it, otherwise show it
              if (!eol || differenceInMonths < MAX_MONTHS_EOL_FILTER) {
                acc.push({
                  className: vendor
                    ? // Use Tux as a fallback.
                      `fl-${distroIcons[vendor] ?? 'tux'}`
                    : `fl-tux`,
                  created,
                  isCloudInitCompatible: capabilities?.includes('cloud-init'),
                  // Add suffix 'deprecated' to the image at end of life.
                  label:
                    differenceInMonths > 0 ? `${label} (deprecated)` : label,
                  value: id,
                });
              }

              return acc;
            }, [])
            .sort(sortByImageVersion),
        });
      });
    }, []);
};

const isMemo = (prevProps: ImageSelectProps, nextProps: ImageSelectProps) => {
  return (
    equals(prevProps.images, nextProps.images) &&
    arePropsEqual<ImageSelectProps>(
      ['selectedImageID', 'error', 'disabled', 'handleSelectImage'],
      prevProps,
      nextProps
    )
  );
};

export const ImageSelect = React.memo((props: ImageSelectProps) => {
  const {
    classNames,
    disabled,
    handleSelectImage,
    images,
    selectedImageID,
    title,
    variant,
    ...reactSelectProps
  } = props;

  // Check for loading status and request errors in React Query
  const { error, isLoading: _loading } = useAllImagesQuery();

  const imageError = error
    ? getAPIErrorOrDefault(error, 'Unable to load Images')[0].reason
    : undefined;

  const filteredImages = images.filter((thisImage) => {
    switch (variant) {
      case 'public':
        /*
         * Get all public images but exclude any Kubernetes images.
         * We don't want them to show up as a selectable image to deploy since
         * the Kubernetes images are used behind the scenes with LKE.
         */
        return (
          thisImage.is_public &&
          thisImage.status === 'available' &&
          !thisImage.label.match(/kube/i)
        );
      case 'private':
        return !thisImage.is_public && thisImage.status === 'available';
      case 'all':
        // We don't show images with 'kube' in the label that are created by Linode
        return !(
          thisImage.label.match(/kube/i) && thisImage.created_by === 'linode'
        );
      default:
        return true;
    }
  });

  const options = imagesToGroupedItems(filteredImages);

  const onChange = (selection: ImageItem | null) => {
    if (selection === null) {
      return handleSelectImage(undefined);
    }

    return handleSelectImage(selection.value);
  };

  return (
    <Paper data-qa-select-image-panel>
      <Typography data-qa-tp={title} variant="h2">
        {title}
      </Typography>
      <Grid container>
        <Grid xs={12}>
          <Select
            value={getSelectedOptionFromGroupedOptions(
              selectedImageID || '',
              options
            )}
            components={{ Option: ImageOption, SingleValue: _SingleValue }}
            disabled={disabled}
            errorText={imageError}
            isLoading={_loading}
            label="Images"
            onChange={onChange}
            options={options}
            placeholder="Choose an image"
            {...reactSelectProps}
            className={classNames}
            menuIsOpen={true}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}, isMemo);
