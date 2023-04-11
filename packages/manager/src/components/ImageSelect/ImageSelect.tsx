import { Image } from '@linode/api-v4/lib/images';
import produce from 'immer';
import { DateTime } from 'luxon';
import { equals, groupBy } from 'ramda';
import * as React from 'react';
import { MAX_MONTHS_EOL_FILTER } from 'src/constants';
import Paper from 'src/components/core/Paper';
import Typography from 'src/components/core/Typography';
import Select, { GroupType, Item } from 'src/components/EnhancedSelect';
import SingleValue from 'src/components/EnhancedSelect/components/SingleValue';
import { BaseSelectProps } from 'src/components/EnhancedSelect/Select';
import Grid from '@mui/material/Unstable_Grid2';
import { useAllImagesQuery } from 'src/queries/images';
import { arePropsEqual } from 'src/utilities/arePropsEqual';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getSelectedOptionFromGroupedOptions from 'src/utilities/getSelectedOptionFromGroupedOptions';
import { distroIcons } from './icons';
import ImageOption from './ImageOption';

export type Variant = 'public' | 'private' | 'all';

interface ImageItem extends Item<string> {
  created: string;
  className: string;
}

interface Props {
  title: string;
  selectedImageID?: string;
  images: Image[];
  error?: string;
  variant?: Variant;
  disabled?: boolean;
  handleSelectImage: (selection?: string) => void;
  classNames?: string;
}

export interface ImageProps
  extends Omit<BaseSelectProps<ImageItem>, 'onChange' | 'variant'> {
  selectedImageID?: string;
  disabled: boolean;
  handleSelectImage: (selection?: string) => void;
  images: Image[];
  error?: string;
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
              const { created, eol, id, label, vendor } = thisImage;
              const differenceInMonths = DateTime.now().diff(
                DateTime.fromISO(eol!),
                'months'
              ).months;
              // if image is past its end of life, hide it, otherwise show it
              if (!eol || differenceInMonths < MAX_MONTHS_EOL_FILTER) {
                acc.push({
                  created,
                  // Add suffix 'depricated' to the image at end of life.
                  label:
                    differenceInMonths > 0 ? `${label} (deprecated)` : label,
                  value: id,
                  className: vendor
                    ? // Use Tux as a fallback.
                      `fl-${distroIcons[vendor] ?? 'tux'}`
                    : `fl-tux`,
                });
              }

              return acc;
            }, [])
            .sort(sortByImageVersion),
        });
      });
    }, []);
};

export const ImageSelect: React.FC<Props> = (props) => {
  const {
    disabled,
    handleSelectImage,
    images,
    selectedImageID,
    title,
    variant,
    classNames,
    ...reactSelectProps
  } = props;

  // Check for loading status and request errors in React Query
  const { isLoading: _loading, error } = useAllImagesQuery();

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
      <Typography variant="h2" data-qa-tp={title}>
        {title}
      </Typography>
      <Grid container>
        <Grid xs={12}>
          <Select
            disabled={disabled}
            label="Images"
            isLoading={_loading}
            placeholder="Choose an image"
            options={options}
            onChange={onChange}
            value={getSelectedOptionFromGroupedOptions(
              selectedImageID || '',
              options
            )}
            errorText={imageError}
            components={{ Option: ImageOption, SingleValue }}
            {...reactSelectProps}
            className={classNames}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

const isMemo = (prevProps: Props, nextProps: Props) => {
  return (
    equals(prevProps.images, nextProps.images) &&
    arePropsEqual<Props>(
      ['selectedImageID', 'error', 'disabled', 'handleSelectImage'],
      prevProps,
      nextProps
    )
  );
};
export default React.memo(ImageSelect, isMemo);
