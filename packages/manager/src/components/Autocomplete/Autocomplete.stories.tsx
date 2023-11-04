import { Linode } from '@linode/api-v4';
import { Region } from '@linode/api-v4/lib/regions';
import Close from '@mui/icons-material/Close';
import { Box, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import { action } from '@storybook/addon-actions';
import React, { useState } from 'react';

import { Country } from 'src/components/RegionSelect/utils';
import { Flag } from 'src/components/Flag';
import { IconButton } from 'src/components/IconButton';
import { List } from 'src/components/List';
import { ListItem } from 'src/components/ListItem';
import { linodeFactory } from 'src/factories';
import { getRegionCountryGroup } from 'src/utilities/formatRegion';

import { Autocomplete } from './Autocomplete';
import { SelectedIcon } from './Autocomplete.styles';

import type { EnhancedAutocompleteProps } from './Autocomplete';
import type { Meta, StoryFn, StoryObj } from '@storybook/react';

const LABEL = 'Select a Linode';

interface OptionType {
  data?: any;
  label: string;
  value: string;
}

const linodes: OptionType[] = [
  {
    label: 'Linode-001',
    value: 'linode-001',
  },
  {
    label: 'Linode-002',
    value: 'linode-002',
  },
  {
    label: 'Linode-003',
    value: 'linode-003',
  },
  {
    label: 'Linode-004',
    value: 'linode-004',
  },
  {
    label: 'Linode-005',
    value: 'linode-005',
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

const AutocompleteWithSeparateSelectedOptions = (
  props: EnhancedAutocompleteProps<OptionType, true>
) => {
  const [selectedOptions, setSelectedOptions] = React.useState<OptionType[]>(
    []
  );

  const handleSelectedOptions = React.useCallback((selected: OptionType[]) => {
    setSelectedOptions(selected);
  }, []);

  // Function to remove an option from the list of selected options
  const removeOption = (optionToRemove: OptionType) => {
    const updatedSelectedOptions = selectedOptions.filter(
      (option) => option.value !== optionToRemove.value
    );

    // Call onSelectionChange to update the selected options
    handleSelectedOptions(updatedSelectedOptions);
  };

  return (
    <Stack>
      <Autocomplete
        {...props}
        multiple
        onChange={(e, selected) => setSelectedOptions(selected)}
        renderTags={() => null}
        value={selectedOptions}
      />
      {selectedOptions.length > 0 && (
        <>
          <SelectedOptionsHeader>{`Linodes to be Unassigned from Subnet (${selectedOptions.length})`}</SelectedOptionsHeader>

          <SelectedOptionsList>
            {selectedOptions.map((option) => (
              <SelectedOptionsListItem alignItems="center" key={option.value}>
                <StyledLabel>{option.label}</StyledLabel>
                <IconButton
                  aria-label={`remove ${option.value}`}
                  disableRipple
                  onClick={() => removeOption(option)}
                  size="medium"
                >
                  <Close />
                </IconButton>
              </SelectedOptionsListItem>
            ))}
          </SelectedOptionsList>
        </>
      )}
    </Stack>
  );
};

// Story Config ========================================================

const meta: Meta<EnhancedAutocompleteProps<OptionType>> = {
  argTypes: {
    onChange: {
      action: 'onChange',
    },
  },
  args: {
    label: LABEL,
    onChange: action('onChange'),
    options: linodes,
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

const StyledLabel = styled('span')(({ theme }) => ({
  color: theme.color.label,
  fontFamily: theme.font.bold,
  fontSize: '14px',
}));

const StyledFlag = styled('span')(({ theme }) => ({
  marginRight: theme.spacing(1),
}));

const SelectedOptionsHeader = styled('h4')(({ theme }) => ({
  color: theme.color.headline,
  fontFamily: theme.font.bold,
  fontSize: '14px',
  textTransform: 'initial',
}));

const SelectedOptionsList = styled(List)(({ theme }) => ({
  background: theme.bg.main,
  maxWidth: '416px',
  padding: '5px 0',
  width: '100%',
}));

const SelectedOptionsListItem = styled(ListItem)(() => ({
  justifyContent: 'space-between',
  paddingBottom: 0,
  paddingTop: 0,
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
    defaultValue: linodes[0],
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

type RegionStory = StoryObj<EnhancedAutocompleteProps<OptionType>>;

export const Regions: RegionStory = {
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

export const CustomRenderOptions: RegionStory = {
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

type MultiSelectStory = StoryObj<EnhancedAutocompleteProps<Linode, true>>;

const linodeList = linodeFactory.buildList(10);

export const MultiSelect: MultiSelectStory = {
  args: {},
  render: () => {
    const Example = () => {
      const [selectedLinodes, setSelectedLinodes] = useState<Linode[]>([]);
      return (
        <Autocomplete
          label="Linodes"
          multiple
          onChange={(_, value) => setSelectedLinodes(value)}
          options={linodeList}
          value={selectedLinodes}
        />
      );
    };

    return <Example />;
  },
};

type MultiSelectWithSeparateSelectionOptionsStory = StoryObj<
  EnhancedAutocompleteProps<OptionType, true>
>;

export const MultiSelectWithSeparateSelectionOptions: MultiSelectWithSeparateSelectionOptionsStory = {
  args: {
    multiple: true,
    onChange: (e, selected: OptionType[]) => {
      action('onChange')(selected.map((options) => options.value));
    },
    placeholder: LABEL,
    selectAllLabel: 'Linodes',
  },
  render: (args) => <AutocompleteWithSeparateSelectedOptions {...args} />,
};
