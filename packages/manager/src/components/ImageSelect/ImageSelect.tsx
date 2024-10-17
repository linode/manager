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
  label?: string;
  placeholder?: string;
  selectIfOnlyOneOption?: boolean;
  variant?: ImageSelectVariant;
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

  const selected = props.value;
  const value = useMemo(() => {
    if (multiple) {
      return options.filter((option) =>
        Array.isArray(selected) ? selected.includes(option.id) : false
      );
    }
    return options.find((i) => i.id === selected) ?? null;
  }, [multiple, options, selected]);

  if (options.length === 1 && onChange && selectIfOnlyOneOption && !multiple) {
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
      label={label || 'Images'}
      loading={isLoading}
      options={options}
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
      disableSelectAll
      errorText={rest.errorText ?? error?.[0].reason}
      multiple={multiple}
      value={value}
    />
  );
};
