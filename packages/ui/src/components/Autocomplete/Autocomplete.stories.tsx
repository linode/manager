import { CloseIcon } from '@linode/ui';
import { styled } from '@mui/material/styles';
import { action } from '@storybook/addon-actions';
import React, { useState } from 'react';

import { IconButton } from '../IconButton';
import { List } from '../List';
import { ListItem } from '../ListItem';
import { Stack } from '../Stack';
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

const AutocompleteWithSeparateSelectedOptions = (
  props: EnhancedAutocompleteProps<OptionType, true>,
) => {
  const [selectedOptions, setSelectedOptions] = React.useState<OptionType[]>(
    [],
  );

  const handleSelectedOptions = React.useCallback((selected: OptionType[]) => {
    setSelectedOptions(selected);
  }, []);

  // Function to remove an option from the list of selected options
  const removeOption = (optionToRemove: OptionType) => {
    const updatedSelectedOptions = selectedOptions.filter(
      (option) => option.value !== optionToRemove.value,
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
                  <CloseIcon />
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
  title: 'Components/Selects/Autocomplete',
};

export default meta;

type Story = StoryObj<typeof Autocomplete>;

// Styled Components =================================================

const CustomValue = styled('span')(({ theme }) => ({
  font: theme.font.bold,
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
  font: theme.font.bold,
  fontSize: '14px',
}));

const SelectedOptionsHeader = styled('h4')(({ theme }) => ({
  color: theme.color.headline,
  font: theme.font.bold,
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

const baseMockLinode = {
  alerts: {
    cpu: 10,
    io: 10000,
    network_in: 0,
    network_out: 0,
    transfer_quota: 80,
  },
  backups: {
    enabled: false,
    last_successful: null,
    schedule: {
      day: null,
      window: null,
    },
  },
  capabilities: [],
  created: '2020-01-01',
  // disk_encryption: 'enabled',
  group: '',
  hypervisor: 'kvm',
  image: 'linode/debian10',
  ipv4: ['50.116.6.212', '192.168.203.1'],
  ipv6: '2600:3c00::f03c:92ff:fee2:6c40/64',
  lke_cluster_id: null,
  region: 'us-east',
  site_type: 'core',
  specs: {
    accelerated_devices: 1,
    disk: 51200,
    gpus: 0,
    memory: 2048,
    transfer: 2000,
    vcpus: 1,
  },
  status: 'running',
  tags: [],
  type: 'g6-standard-1',
  updated: '2020-01-01',
  watchdog_enabled: true,
};

const mockLinodes = [
  { ...baseMockLinode, id: 1, label: 'linode-1' } as Linode,
  { ...baseMockLinode, id: 2, label: 'linode-2' } as Linode,
  { ...baseMockLinode, id: 3, label: 'linode-3' } as Linode,
  { ...baseMockLinode, id: 4, label: 'linode-4' } as Linode,
];

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
          options={mockLinodes}
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

export const MultiSelectWithSeparateSelectionOptions: MultiSelectWithSeparateSelectionOptionsStory =
  {
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

// simplified Linode interface for use in this file (api-v4 is not a dependency of ui)
export interface Linode {
  alerts: object;
  backups: object;
  created: string;
  group: string;
  hypervisor: string;
  id: number;
  image: null | string;
  ipv4: string[];
  ipv6: null | string;
  label: string;
  lke_cluster_id: null | number;
  region: string;
  site_type: string;
  specs: object;
  status: string;
  tags: string[];
  type: null | string;
  updated: string;
  watchdog_enabled: boolean;
}
