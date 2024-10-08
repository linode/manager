import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { imageFactory } from 'src/factories';
import { getImageGroup } from 'src/utilities/images';

import type { Image } from '@linode/api-v4/lib/images';

interface BaseProps {
  anyAllOption?: boolean;
  disabled?: boolean;
  errorText?: string;
  helperText?: string;
  images: Image[];
  label?: string;
  required?: boolean;
}

interface Props extends BaseProps {
  isMulti?: false;
  onSelect: (image: Image) => void;
  value?: string;
}

interface MultiProps extends BaseProps {
  isMulti: true;
  onSelect: (selected: Image[]) => void;
  value?: string[];
}

export const TargetImageSelect = (props: MultiProps | Props) => {
  const {
    anyAllOption,
    disabled,
    errorText,
    helperText,
    images,
    isMulti,
    label,
    onSelect,
    required,
    value,
  } = props;

  const options = React.useMemo(
    () => [
      ...(anyAllOption
        ? [
            imageFactory.build({
              id: 'any/all',
              label: 'Any/All',
            }),
          ]
        : []),
      ...images,
    ],
    [anyAllOption, images]
  );

  return (
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
        width: '100%',
      }}
    >
      <Autocomplete
        onChange={(_, value) => {
          if (isMulti && Array.isArray(value)) {
            onSelect((value ?? []) as Image[]);
          } else if (!isMulti) {
            onSelect((value as Image) ?? null);
          }
        }}
        textFieldProps={{
          required,
          tooltipText: helperText ?? 'Choosing a 64-bit distro is recommended.',
        }}
        value={
          isMulti
            ? options.filter((option) => value?.includes(option.id)) ?? []
            : options.find((option) => option.id === value) ??
              (value ? null : undefined)
        }
        disableCloseOnSelect={false}
        disableSelectAll
        disabled={disabled}
        errorText={errorText}
        filterSelectedOptions
        groupBy={getImageGroup}
        label={label ?? 'Image'}
        multiple={isMulti}
        options={options}
        placeholder="Select an Image"
      />
    </Box>
  );
};
