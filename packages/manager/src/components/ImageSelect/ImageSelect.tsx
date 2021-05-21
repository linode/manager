import produce from 'immer';
import { Image } from '@linode/api-v4/lib/images';
import { equals, groupBy } from 'ramda';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Select, { GroupType, Item } from 'src/components/EnhancedSelect';
import SingleValue from 'src/components/EnhancedSelect/components/SingleValue';
import { BaseSelectProps } from 'src/components/EnhancedSelect/Select';
import Grid from 'src/components/Grid';
import { useImages } from 'src/hooks/useImages';
import { useReduxLoad } from 'src/hooks/useReduxLoad';
import { arePropsEqual } from 'src/utilities/arePropsEqual';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getSelectedOptionFromGroupedOptions from 'src/utilities/getSelectedOptionFromGroupedOptions';
import { distroIcons } from './icons';
import ImageOption from './ImageOption';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(3),
  },
}));

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
  extends Omit<BaseSelectProps, 'onChange' | 'variant'> {
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

export const sortGroupsWithMyImagesAtTheEnd = (a: string, b: string) => {
  if (a === 'My Images') {
    return 1;
  }
  if (b === 'My Images') {
    return -1;
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
    .sort(sortGroupsWithMyImagesAtTheEnd)
    .reduce((accum: GroupType<string>[], thisGroup) => {
      const group = groupedImages[thisGroup];
      if (!group || group.length === 0) {
        return accum;
      }
      return produce(accum, (draft) => {
        draft.push({
          label: thisGroup,
          options: group
            .map((thisImage) => {
              const isDeprecated = thisImage.deprecated;
              const fullLabel =
                thisImage.label + (isDeprecated ? ' (Deprecated)' : '');
              return {
                created: thisImage.created,
                label: fullLabel,
                value: thisImage.id,
                className: thisImage.vendor
                  ? // Use Tux as a fallback.
                    `fl-${distroIcons[thisImage.vendor] ?? 'tux'}`
                  : `fl-tux`,
              };
            })
            .sort(sortByImageVersion),
        });
      });
    }, []);
};

export const ImageSelect: React.FC<Props> = (props) => {
  const {
    disabled,
    error,
    handleSelectImage,
    images,
    selectedImageID,
    title,
    variant,
    classNames,
    ...reactSelectProps
  } = props;
  const classes = useStyles();

  const { _loading } = useReduxLoad(['images']);

  // Check for request errors in Redux
  const { images: _images } = useImages();
  const imageError = _images?.error?.read
    ? getAPIErrorOrDefault(_images.error.read, 'Unable to load Images')[0]
        .reason
    : undefined;

  const filteredImages = images.filter((thisImage) => {
    switch (variant) {
      case 'public':
        return thisImage.is_public && thisImage.status === 'available';
      case 'private':
        return !thisImage.is_public && thisImage.status === 'available';
      case 'all':
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
    <Paper className={classes.root} data-qa-select-image-panel>
      <Typography variant="h2" data-qa-tp={title}>
        {title}
      </Typography>
      <Grid container direction="row" wrap="nowrap" spacing={4}>
        <Grid container item direction="column">
          <Grid container item direction="row">
            <Grid item xs={12}>
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
                errorText={error || imageError}
                components={{ Option: ImageOption, SingleValue }}
                {...reactSelectProps}
                className={classNames}
              />
            </Grid>
          </Grid>
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
