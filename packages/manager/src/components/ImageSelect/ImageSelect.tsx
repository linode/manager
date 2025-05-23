import { useAllImagesQuery } from '@linode/queries';
import {
  Autocomplete,
  Box,
  InputAdornment,
  Notice,
  Stack,
  Typography,
} from '@linode/ui';
import { DateTime } from 'luxon';
import React, { useMemo } from 'react';

import { imageFactory } from 'src/factories/images';
import { formatDate } from 'src/utilities/formatDate';

import { OSIcon } from '../OSIcon';
import { ImageOption } from './ImageOption';
import {
  getAPIFilterForImageSelect,
  getDisabledImages,
  getFilteredImagesForImageSelect,
  isImageDeprecated,
} from './utilities';

import type { Image, RegionSite } from '@linode/api-v4';
import type { EnhancedAutocompleteProps } from '@linode/ui';

export type ImageSelectVariant = 'all' | 'private' | 'public';

interface BaseProps
  extends Omit<
    Partial<EnhancedAutocompleteProps<Image>>,
    'multiple' | 'onChange' | 'value'
  > {
  anyAllOption?: boolean;
  filter?: (image: Image) => boolean;
  groupBy?: (image: Image) => string;
  label?: string;
  placeholder?: string;
  selectIfOnlyOneOption?: boolean;
  siteType?: RegionSite;
  variant: ImageSelectVariant;
}

interface SingleProps extends BaseProps {
  multiple?: false;
  onChange: (selected: Image | null) => void;
  value: ((image: Image) => boolean) | null | string;
}

interface MultiProps extends BaseProps {
  multiple: true;
  onChange: (selected: Image[]) => void;
  value: ((image: Image) => boolean) | null | string[];
}

export type Props = MultiProps | SingleProps;

export const ImageSelect = (props: Props) => {
  const {
    anyAllOption,
    filter,
    label,
    multiple,
    onChange,
    placeholder,
    selectIfOnlyOneOption,
    siteType,
    variant,
    ...rest
  } = props;

  const {
    data: images,
    error,
    isLoading,
  } = useAllImagesQuery({}, getAPIFilterForImageSelect(variant));

  const disabledImages = getDisabledImages({
    images: images ?? [],
    site_type: siteType,
  });

  const _options = useMemo(() => {
    // We can't filter out Kubernetes images using the API so we do it client side
    const filteredOptions =
      getFilteredImagesForImageSelect(images, variant) ?? [];

    return filter ? filteredOptions.filter(filter) : filteredOptions;
  }, [images, filter, variant]);

  const options = useMemo(() => {
    if (anyAllOption) {
      return [
        imageFactory.build({
          eol: undefined,
          id: 'any/all',
          label: 'Any/All',
        }),
        ..._options,
      ];
    }
    return _options;
  }, [anyAllOption, _options]);

  // We need to sort options when grouping in order to avoid duplicate headers
  // see https://mui.com/material-ui/react-autocomplete/#grouped
  // We want:
  // - Vendors to be sorted alphabetically
  // - "My Images" to be first
  // - Images to be sorted by creation date, newest first
  const sortedOptions = useMemo(() => {
    const myImages = options.filter((option) => !option.is_public);
    const otherImages = options.filter((option) => option.is_public);

    const sortedVendors = Array.from(
      new Set(otherImages.map((img) => img.vendor))
    ).sort((a, b) => (a ?? '').localeCompare(b ?? ''));

    return [
      ...myImages.sort(
        (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
      ),
      ...sortedVendors.flatMap((vendor) =>
        otherImages
          .filter((img) => img.vendor === vendor)
          .sort(
            (a, b) =>
              new Date(b.created).getTime() - new Date(a.created).getTime()
          )
      ),
    ];
  }, [options]);

  const selected = props.value;
  const value = useMemo(() => {
    if (multiple) {
      return options.filter((option) =>
        Array.isArray(selected) ? selected.includes(option.id) : false
      );
    }
    return options.find((option) => option.id === selected) ?? null;
  }, [multiple, options, selected]);

  const selectedDeprecatedImages = useMemo(() => {
    if (!value) {
      return false;
    }
    if (Array.isArray(value)) {
      return value.filter((img) => isImageDeprecated(img));
    }
    return isImageDeprecated(value) && [value];
  }, [value]);

  if (options.length === 1 && onChange && selectIfOnlyOneOption && !multiple) {
    onChange(options[0]);
  }

  return (
    <Box>
      <Autocomplete
        clearOnBlur
        disableSelectAll
        groupBy={(option) => {
          if (option.id === 'any/all') {
            return '';
          }
          if (!option.is_public) {
            return 'My Images';
          }

          return option.vendor ?? '';
        }}
        label={label || 'Images'}
        loading={isLoading}
        options={sortedOptions}
        placeholder={placeholder || 'Choose an image'}
        renderOption={(props, option, state) => {
          const { key, ...rest } = props;

          return (
            <ImageOption
              disabledOptions={disabledImages[option.id]}
              item={option}
              key={key}
              props={rest}
              selected={state.selected}
            />
          );
        }}
        textFieldProps={{
          slotProps: {
            input: {
              startAdornment:
                !multiple && value && !Array.isArray(value) ? (
                  <InputAdornment position="start">
                    <OSIcon
                      fontSize="20px"
                      height="20px"
                      os={value.vendor ?? ''}
                      position="relative"
                      top={1}
                    />
                  </InputAdornment>
                ) : null,
            },
          },
        }}
        {...rest}
        disableClearable={
          rest.disableClearable ??
          (selectIfOnlyOneOption && options.length === 1 && !multiple)
        }
        errorText={rest.errorText ?? error?.[0].reason}
        getOptionDisabled={(option) => Boolean(disabledImages[option.id])}
        multiple={multiple}
        onChange={(_, value) =>
          multiple && Array.isArray(value)
            ? onChange(value)
            : !multiple && !Array.isArray(value) && onChange(value)
        }
        value={value}
      />

      <Stack>
        {selectedDeprecatedImages &&
          selectedDeprecatedImages.map((image) => (
            <Notice
              dataTestId="os-distro-deprecated-image-notice"
              key={image.id}
              spacingBottom={0}
              spacingTop={16}
              variant="warning"
            >
              {image.eol && DateTime.fromISO(image.eol) > DateTime.now() ? (
                <Typography sx={(theme) => ({ font: theme.font.bold })}>
                  {image.label} will reach its end-of-life on{' '}
                  {formatDate(image.eol ?? '', { format: 'MM/dd/yyyy' })}. After
                  this date, this OS distribution will no longer receive
                  security updates or technical support. We recommend selecting
                  a newer supported version to ensure continued security and
                  stability for your linodes.
                </Typography>
              ) : (
                <Typography sx={(theme) => ({ font: theme.font.bold })}>
                  {image.label} reached its end-of-life on{' '}
                  {formatDate(image.eol ?? '', { format: 'MM/dd/yyyy' })}. This
                  OS distribution will no longer receive security updates or
                  technical support. We recommend selecting a newer supported
                  version to ensure continued security and stability for your
                  linodes.
                </Typography>
              )}
            </Notice>
          ))}
      </Stack>
    </Box>
  );
};
