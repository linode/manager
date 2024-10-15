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
    'onChange' | 'value'
  > {
  anyAllOption?: boolean;
  filter?: (image: Image) => boolean;
  label?: string;
  placeholder?: string;
  selectIfOnlyOneOption?: boolean;
  variant?: ImageSelectVariant;
}

interface SingleProps extends BaseProps {
  isMulti?: false;
  onChange?: (image: Image | null) => void;
  value: null | string | undefined;
}

interface MultiProps extends BaseProps {
  isMulti: true;
  onChange?: (images: Image[]) => void;
  value: string[];
}

export type Props = MultiProps | SingleProps;

export const ImageSelect = (props: Props) => {
  const {
    anyAllOption,
    filter,
    isMulti,
    label,
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
    const filteredOptions =
      getFilteredImagesForImageSelect(images, variant) ?? [];

    return (filter ? filteredOptions.filter(filter) : filteredOptions).sort(
      (a, b) => {
        // Sort by vendor first
        const vendorA = a.vendor ?? '';
        const vendorB = b.vendor ?? '';
        if (vendorA < vendorB) {
          return -1;
        }
        if (vendorA > vendorB) {
          return 1;
        }

        return a.label.localeCompare(b.label);
      }
    );
  }, [images, variant, filter]);

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

  const value = useMemo(() => {
    if (isMulti) {
      return options.filter((option) => props.value.includes(option.id));
    }
    return options.find((i) => i.id === props.value) ?? null;
  }, [isMulti, options, props.value]);

  if (options.length === 1 && onChange && selectIfOnlyOneOption && !isMulti) {
    onChange(options[0]);
  }

  return (
    <Autocomplete
      groupBy={(option) =>
        option.id === 'any/all' ? '' : option.vendor ?? 'My Images'
      }
      renderOption={(props, option, state) => (
        <ImageOption
          image={option}
          isSelected={state.selected}
          key={option.id}
          listItemProps={props}
        />
      )}
      textFieldProps={{
        InputProps: {
          startAdornment:
            !isMulti && value && !Array.isArray(value) ? (
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
      label={label || 'Images'}
      loading={isLoading}
      options={options}
      placeholder={placeholder || 'Choose an image'}
      {...rest}
      disableClearable={
        rest.disableClearable ??
        (selectIfOnlyOneOption && options.length === 1 && !isMulti)
      }
      onChange={(e, selectedValue) => {
        if (onChange) {
          if (isMulti && Array.isArray(selectedValue)) {
            onChange(selectedValue as Image[]);
          } else if (!isMulti) {
            onChange(selectedValue as Image | null);
          }
        }
      }}
      disableSelectAll
      errorText={rest.errorText ?? error?.[0].reason}
      multiple={isMulti}
      value={value}
    />
  );
};
