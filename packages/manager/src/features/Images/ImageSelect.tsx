import { Image } from '@linode/api-v4/lib/images';
import { Box } from 'src/components/Box';
import { clone, propOr } from 'ramda';
import * as React from 'react';

import Select, { GroupType, Item } from 'src/components/EnhancedSelect/Select';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { useAllImagesQuery } from 'src/queries/images';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { groupImages } from 'src/utilities/images';

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
  onSelect: (selected: Item) => void;
  value?: Item;
}

interface MultiProps extends BaseProps {
  isMulti: true;
  onSelect: (selected: Item[]) => void;
  value?: Item[];
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
        <Select
          textFieldProps={{
            required,
          }}
          disabled={disabled || Boolean(imageError)}
          errorText={imageError || imageFieldError || rqError}
          id={'image-select'}
          isLoading={imagesLoading}
          isMulti={Boolean(isMulti)}
          label={label || 'Image'}
          onChange={onSelect}
          options={imageSelectOptions as any}
          placeholder="Select an Image"
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
    (accumulator: GroupType<string>[], category: string) => {
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
