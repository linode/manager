import { styled } from '@mui/material/styles';
import React, { useMemo } from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { List } from 'src/components/List';
import { Typography } from 'src/components/Typography';
import { imageFactory } from 'src/factories/images';
import { useAllImagesQuery } from 'src/queries/images';
import { filterImageForStackScript } from 'src/utilities/images';

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
  filterForStackScript?: boolean;
  groupBy?: (image: Image) => string;
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
    filterForStackScript,
    groupBy,
    label,
    multiple,
    onChange,
    placeholder,
    selectIfOnlyOneOption,
    variant = 'all',
    ...rest
  } = props;

  const { data: images, error, isLoading } = useAllImagesQuery(
    {},
    getAPIFilterForImageSelect(variant)
  );

  const _options = useMemo(() => {
    const filteredOptions =
      getFilteredImagesForImageSelect(images, variant) ?? [];

    if (filterForStackScript) {
      return filteredOptions.filter((image) =>
        filterImageForStackScript(image, variant)
      );
    }

    return filter ? filteredOptions.filter(filter) : filteredOptions;
  }, [images, filter, filterForStackScript, variant]);

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
    return options.find((option) => option.id === selected) ?? null;
  }, [multiple, options, selected]);

  if (options.length === 1 && onChange && selectIfOnlyOneOption && !multiple) {
    onChange(options[0]);
  }

  return (
    <Autocomplete
      groupBy={(option) => {
        if (groupBy) {
          return groupBy(option);
        }
        if (option.id === 'any/all') {
          return '';
        }
        if (!option.is_public) {
          return 'My Images';
        }

        return option.vendor ?? '';
      }}
      renderGroup={(params) => (
        <li key={params.key}>
          <Typography
            sx={(theme) => ({
              backgroundColor: theme.palette.background.paper,
              pl: 1,
              py: 0.75,
            })}
            variant="h3"
          >
            {params.group}
          </Typography>
          <StyledList>
            {React.Children.map(params.children, (child) => (
              <li key={`${params.key}-${child}`}>{child}</li>
            ))}
          </StyledList>
        </li>
      )}
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

const StyledList = styled(
  List,
  {}
)({
  listStyle: 'none',
  padding: 0,
});
