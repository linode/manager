import Autocomplete from '@mui/material/Autocomplete';
import { clone, propOr } from 'ramda';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { TextField } from 'src/components/TextField';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { useAllImagesQuery } from 'src/queries/images';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { groupImages } from 'src/utilities/images';

import type { Image } from '@linode/api-v4/lib/images';

export interface SelectImageOption {
  label: string;
  value: string;
}

export interface ImagesGroupType {
  label: string;
  options: SelectImageOption[];
}
interface BaseProps {
  anyAllOption?: boolean;
  disabled?: boolean;
  helperText?: string;
  imageError?: string;
  imageFieldError?: string;
  images: Image[];
  label?: string;
  required?: boolean;
}

interface Props extends BaseProps {
  isMulti?: false;
  onSelect: (selected: SelectImageOption) => void;
  value?: SelectImageOption;
}

interface MultiProps extends BaseProps {
  isMulti: true;
  onSelect: (selected: SelectImageOption[]) => void;
  value?: SelectImageOption[];
}

export const ImageSelect = (props: MultiProps | Props) => {
  const {
    anyAllOption,
    disabled,
    helperText,
    imageError,
    imageFieldError,
    images,
    isMulti,
    label,
    onSelect,
    required,
    value,
  } = props;

  const { error, isError, isLoading: imagesLoading } = useAllImagesQuery(
    {},
    {}
  );

  // Check for request errors in RQ
  const rqError = isError
    ? getAPIErrorOrDefault(error ?? [], 'Unable to load Images')[0].reason
    : undefined;

  const renderedImages = React.useMemo(() => getImagesOptions(images), [
    images,
  ]);

  const imageSelectOptions = clone(renderedImages);

  if (anyAllOption) {
    imageSelectOptions.unshift({
      label: '',
      options: [
        {
          label: 'Any/All',
          value: 'any/all',
        },
      ],
    });
  }

  const formattedOptions = imageSelectOptions.flatMap(
    (option) => option.options
  );

  return (
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
        width: '100%',
      }}
    >
      <Box
        sx={{
          width: '415px',
        }}
      >
        <Autocomplete
          groupBy={(option) => {
            const group = imageSelectOptions.find((group) =>
              group.options.includes(option)
            );
            return group ? String(group.label) : '';
          }}
          onChange={(event, value) => {
            onSelect(value ?? []);
          }}
          renderInput={(params) => (
            <TextField
              helperText={
                helperText || 'Choosing a 64-bit distro is recommended.'
              }
              aria-label={label || 'Image'}
              errorText={imageError || imageFieldError || rqError}
              label={label || 'Image'}
              placeholder="Select an Image"
              required={required}
              {...params}
            />
          )}
          disabled={disabled || Boolean(imageError)}
          id={'image-select'}
          loading={imagesLoading}
          multiple={Boolean(isMulti)}
          options={formattedOptions}
          value={value}
        />
      </Box>
      <Box>
        <TooltipIcon
          sxTooltipIcon={{
            transform: 'translateY(50%)',
          }}
          status="help"
          text={helperText || 'Choosing a 64-bit distro is recommended.'}
        />
      </Box>
    </Box>
  );
};

export const getImagesOptions = (images: Image[]) => {
  const groupedImages = groupImages(images);
  return ['recommended', 'older', 'images', 'deleted'].reduce(
    (accumulator: ImagesGroupType[], category: string) => {
      if (groupedImages[category]) {
        return [
          ...accumulator,
          {
            label: getDisplayNameForGroup(category),
            options: groupedImages[category].map(({ id, label }: Image) => ({
              label,
              value: id,
            })),
          },
        ];
      }
      return accumulator;
    },
    []
  );
};

export const groupNameMap = {
  _default: 'Other',
  deleted: 'Recently Deleted Disks',
  images: 'Images',
  older: 'Older Distributions',
  recommended: '64-bit Distributions - Recommended',
};

const getDisplayNameForGroup = (key: string) =>
  propOr('Other', key, groupNameMap);

export default ImageSelect;
