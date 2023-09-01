import { Region } from '@linode/api-v4/lib/regions';
import { Box, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import { action } from '@storybook/addon-actions';
import React from 'react';

import { Country } from 'src/components/EnhancedSelect/variants/RegionSelect/utils';
import { Flag } from 'src/components/Flag';
import { getRegionCountryGroup } from 'src/utilities/formatRegion';

import { Autocomplete } from './Autocomplete';
import { SelectedIcon } from './Autocomplete.styles';

import type { EnhancedAutocompleteProps, OptionType } from './Autocomplete';
import type { Meta, StoryFn, StoryObj } from '@storybook/react';

interface FruitProps {
  label: string;
  value: string;
}

const fruits: FruitProps[] = [
  {
    label: 'Apple',
    value: 'apple',
  },
  {
    label: 'Pear',
    value: 'pear',
  },
  {
    label: 'Mango',
    value: 'mango',
  },
  {
    label: 'Durian',
    value: 'durian',
  },
  {
    label: 'Strawberry',
    value: 'strawberry',
  },
];

const fakeRegionsData = [
  {
    country: 'us',
    id: 'us-east',
    label: 'Newark, NJ',
  },
  {
    country: 'us',
    id: 'us-central',
    label: 'Texas, TX',
  },
  {
    country: 'fr',
    id: 'fr-par',
    label: 'Paris, FR',
  },
  {
    country: 'br',
    id: 'br-sao',
    label: 'Sao Paulo, BR',
  },
  {
    country: 'jp',
    id: 'jp-tyo',
    label: 'Tokyo, JP',
  },
];

const getRegionsOptions = (
  fakeRegionsData: Pick<Region, 'country' | 'id' | 'label'>[]
) => {
  return fakeRegionsData.map((region: Region) => {
    const group = getRegionCountryGroup(region);
    return {
      data: {
        country: region.country,
        flag: <Flag country={region.country as Lowercase<Country>} />,
        region: group,
      },
      label: `${region.label} (${region.id})`,
      value: region.id,
    };
  });
};

// Story Config ========================================================

const meta: Meta<EnhancedAutocompleteProps<OptionType>> = {
  argTypes: {
    onSelectionChange: {
      action: 'onSelectionChange',
    },
  },
  args: {
    label: 'Select a Fruit',
    onSelectionChange: action('onSelectionChange'),
    options: fruits,
  },
  component: Autocomplete,
  decorators: [
    (Story: StoryFn) => (
      <div style={{ marginLeft: '2em', minHeight: 270 }}>
        <Story />
      </div>
    ),
  ],
  title: 'Components/Autocomplete',
};

export default meta;

type Story = StoryObj<typeof Autocomplete>;

// Styled Components =================================================

const CustomValue = styled('span')(({ theme }) => ({
  fontFamily: theme.font.bold,
  fontSize: '1rem',
  wordBreak: 'break-word',
}));

const CustomDescription = styled('span')(() => ({
  fontSize: '0.875rem',
}));

const StyledListItem = styled('li')(() => ({
  alignItems: 'center',
  display: 'flex',
  width: '100%',
}));

const StyledFlag = styled('span')(({ theme }) => ({
  marginRight: theme.spacing(1),
}));

const GroupHeader = styled('div')(({ theme }) => ({
  color: theme.color.headline,
  fontFamily: theme.font.bold,
  fontSize: '1rem',
  padding: '15px 4px 4px 10px',
  textTransform: 'initial',
}));

const GroupItems = styled('ul')({
  padding: 0,
});

// Story Definitions ==========================================================

export const Default: Story = {
  args: {
    defaultValue: fruits[0],
  },
  render: (args) => <Autocomplete {...args} />,
};

export const NoOptionsMessage: Story = {
  args: {
    noOptionsText:
      'This is a custom message when there are no options to display.',
    options: [],
  },
  render: (args) => <Autocomplete {...args} />,
};

export const Regions: Story = {
  args: {
    groupBy: (option) => option.data.region,
    label: 'Select a Region',
    options: getRegionsOptions(fakeRegionsData),
    placeholder: 'Select a Region',
    renderGroup: (params) => (
      <li key={params.key}>
        <GroupHeader>{params.group}</GroupHeader>
        <GroupItems>{params.children}</GroupItems>
      </li>
    ),
    renderOption: (props, option, { selected }) => {
      return (
        <StyledListItem {...props}>
          <Box alignItems={'center'} display={'flex'} flexGrow={1}>
            <StyledFlag>{option.data.flag}</StyledFlag>
            {option.label}
          </Box>
          <SelectedIcon visible={selected} />
        </StyledListItem>
      );
    },
  },
  render: (args) => <Autocomplete {...args} />,
};

export const CustomRenderOptions: Story = {
  args: {
    label: 'Select a Linode to Clone',
    options: [
      {
        label: 'Nanode 1 GB, Debian 11, Newark, NJ',
        value: 'debian-us-east',
      },
      {
        label: 'Nanode 2 GB, Debian 11, Newark, NJ',
        value: 'debian-us-east-001',
      },
      {
        label: 'Nanode 3 GB, Debian 11, Newark, NJ',
        value: 'debian-us-east-002',
      },
    ],
    placeholder: 'Select a Linode to Clone',
    renderOption: (props, option, { selected }) => (
      <StyledListItem {...props}>
        <Stack flexGrow={1}>
          <CustomValue>{option.value}</CustomValue>
          <CustomDescription>{option.label}</CustomDescription>
        </Stack>
        <SelectedIcon visible={selected} />
      </StyledListItem>
    ),
  },
  render: (args) => <Autocomplete {...args} />,
};

export const MultiSelect: Story = {
  args: {
    defaultValue: [fruits[0]],
    multiple: true,
    onSelectionChange: (selected: OptionType[]) => {
      action('onSelectionChange')(selected.map((options) => options.value));
    },
    placeholder: 'Select a Fruit',
    selectAllLabel: 'Fruits',
  },
  render: (args) => <Autocomplete {...args} />,
};
