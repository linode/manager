import produce from 'immer';
import { Image } from 'linode-js-sdk/lib/images';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { BaseSelectProps } from 'src/components/EnhancedSelect/Select';

import Grid from 'src/components/Grid';

import { groupBy } from 'ramda';

import Select, { GroupType, Item } from 'src/components/EnhancedSelect';
import SingleValue from 'src/components/EnhancedSelect/components/SingleValue';
import Notice from 'src/components/Notice';
import getSelectedOptionFromGroupedOptions from 'src/utilities/getSelectedOptionFromGroupedOptions';

import { distroIcons } from './icons';
import ImageOption from './ImageOption';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(3)
  }
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
  variant?: Variant; // @todo no one uses "all", either use or remove
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
      return produce(accum, draft => {
        draft.push({
          label: thisGroup,
          options: group
            .map(thisImage => {
              const _option = {
                created: thisImage.created,
                label: thisImage.label,
                value: thisImage.id,
                className: thisImage.vendor
                  ? `fl-${distroIcons[thisImage.vendor]}`
                  : `fl-tux`
              };
              return _option;
            })
            .sort(sortByImageVersion)
        });
      });
    }, []);
};

export const ImageSelect: React.FC<Props> = props => {
  const {
    disabled,
    error,
    handleSelectImage,
    images,
    selectedImageID,
    title,
    variant,
    ...reactSelectProps
  } = props;
  const classes = useStyles();

  const filteredImages = images.filter(thisImage => {
    switch (variant) {
      case 'public':
        return thisImage.is_public;
      case 'private':
        return !thisImage.is_public;
      case 'all':
      default:
        return true;
    }
  });

  const options = imagesToGroupedItems(filteredImages);

  const onChange = (selection: ImageItem | null) => {
    if (selection === null) {
      return handleSelectImage('');
    }

    return handleSelectImage(selection.value);
  };

  return (
    <>
      <Paper className={classes.root} data-qa-select-image-panel>
        <Typography variant="h2" data-qa-tp={title}>
          {title}
        </Typography>
        <Grid container direction="row" wrap="nowrap" spacing={4}>
          <Grid container item direction="column">
            <Grid item>
              {error && (
                <Notice spacingTop={8} spacingBottom={0} error text={error} />
              )}
            </Grid>
            <Grid container item direction="row">
              <Grid item xs={6}>
                <Select
                  disabled={disabled}
                  label="Images"
                  placeholder="Choose an image"
                  options={options}
                  onChange={onChange}
                  value={getSelectedOptionFromGroupedOptions(
                    selectedImageID || '',
                    options
                  )}
                  components={{ Option: ImageOption, SingleValue }}
                  {...reactSelectProps}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
};

export default ImageSelect;
