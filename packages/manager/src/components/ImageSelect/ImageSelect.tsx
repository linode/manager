import React, { useMemo } from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { imageFactory } from 'src/factories/images';
import { useAllImagesQuery } from 'src/queries/images';

import { OSIcon } from '../OSIcon';
import { ImageOption } from './ImageOption';
import {
  getAPIFilterForImageSelect,
  getFilteredImagesForImageSelect,
} from './utilities';

import type { Image } from '@linode/api-v4';
import type { EnhancedAutocompleteProps } from 'src/components/Autocomplete/Autocomplete';

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
    variant,
    ...rest
  } = props;

  const { data: images, error, isLoading } = useAllImagesQuery(
    {},
    getAPIFilterForImageSelect(variant)
  );

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

  if (options.length === 1 && onChange && selectIfOnlyOneOption && !multiple) {
    onChange(options[0]);
  }

  return (
    <Autocomplete
      groupBy={(option) => {
        if (option.id === 'any/all') {
          return '';
        }
        if (!option.is_public) {
          return 'My Images';
        }

        return option.vendor ?? '';
      }}
      renderOption={(props, option, state) => {
        const { key, ...rest } = props;

        return (
          <ImageOption
            image={option}
            isSelected={state.selected}
            key={key}
            listItemProps={rest}
          />
        );
      }}
      textFieldProps={{
        InputProps: {
          startAdornment:
            !multiple && value && !Array.isArray(value) ? (
              <OSIcon
                fontSize="24px"
                height="24px"
                os={value.vendor ?? ''}
                pl={1}
                pr={2}
              />
            ) : null,
        },
      }}
      clearOnBlur
      disableSelectAll
      label={label || 'Images'}
      loading={isLoading}
      options={sortedOptions}
      placeholder={placeholder || 'Choose an image'}
      {...rest}
      disableClearable={
        rest.disableClearable ??
        (selectIfOnlyOneOption && options.length === 1 && !multiple)
      }
      onChange={(_, value) =>
        multiple && Array.isArray(value)
          ? onChange(value)
          : !multiple && !Array.isArray(value) && onChange(value)
      }
      errorText={rest.errorText ?? error?.[0].reason}
      multiple={multiple}
      value={value}
    />
  );
};
