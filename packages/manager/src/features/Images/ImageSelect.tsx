import { Image } from '@linode/api-v4/lib/images';
import { clone, propOr } from 'ramda';
import * as React from 'react';
import Select, { GroupType, Item } from 'src/components/EnhancedSelect/Select';
import Box from '@mui/material/Box';
import { TooltipIcon } from 'src/components/TooltipIcon/TooltipIcon';
import { useAllImagesQuery } from 'src/queries/images';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { groupImages } from 'src/utilities/images';

interface Props {
  images: Image[];
  imageError?: string;
  imageFieldError?: string;
  isMulti?: boolean;
  helperText?: string;
  value?: Item | Item[];
  disabled?: boolean;
  onSelect: (selected: Item<any> | Item<any>[]) => void;
  label?: string;
  required?: boolean;
  anyAllOption?: boolean;
}

type CombinedProps = Props;

export const ImageSelect: React.FC<CombinedProps> = (props) => {
  const {
    helperText,
    images,
    imageError,
    imageFieldError,
    isMulti,
    label,
    onSelect,
    value,
    disabled,
    required,
    anyAllOption,
  } = props;

  const { isLoading: imagesLoading, isError, error } = useAllImagesQuery(
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
          id={'image-select'}
          isLoading={imagesLoading}
          value={value}
          isMulti={Boolean(isMulti)}
          errorText={imageError || imageFieldError || rqError}
          disabled={disabled || Boolean(imageError)}
          onChange={onSelect}
          options={imageSelectOptions as any}
          placeholder="Select an Image"
          textFieldProps={{
            required,
          }}
          label={label || 'Image'}
        />
      </Box>
      <Box>
        <TooltipIcon
          sxTooltipIcon={{
            transform: 'translateY(50%)',
          }}
          text={helperText || 'Choosing a 64-bit distro is recommended.'}
          status="help"
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
  recommended: '64-bit Distributions - Recommended',
  older: 'Older Distributions',
  images: 'Images',
};

const getDisplayNameForGroup = (key: string) =>
  propOr('Other', key, groupNameMap);

export default ImageSelect;
