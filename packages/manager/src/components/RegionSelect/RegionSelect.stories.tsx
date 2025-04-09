import { Box } from '@linode/ui';
import { useArgs } from '@storybook/preview-api';
import React from 'react';

import { regions } from 'src/__data__/regionsData';

import { RegionSelect } from './RegionSelect';

import type { RegionSelectProps } from './RegionSelect.types';
import type { Meta, StoryObj } from '@storybook/react';

export const Default: StoryObj<RegionSelectProps> = {
  render: (args) => {
    const SelectWrapper = () => {
      const [_, updateArgs] = useArgs();
      return (
        <Box sx={{ minHeight: 500 }}>
          <RegionSelect
            {...args}
            onChange={(e, region) => updateArgs({ value: region?.id })}
          />
        </Box>
      );
    };

    return SelectWrapper();
  },
};

const meta: Meta<RegionSelectProps> = {
  args: {
    currentCapability: undefined,
    disabled: false,
    errorText: '',
    helperText: '',
    label: 'Region',
    regions,
    required: true,
    value: regions[2].id,
  },
  component: RegionSelect,
  title: 'Components/Selects/Region Select',
};
export default meta;
