import React from 'react';

import { regions } from 'src/__data__/regionsData';
import { Box } from 'src/components/Box';

import { RegionSelect } from './RegionSelect';

import type { RegionSelectProps } from './RegionSelect.types';
import type { Meta, StoryObj } from '@storybook/react';

export const Default: StoryObj<RegionSelectProps> = {
  render: (args) => {
    const SelectWrapper = () => {
      const [open, setOpen] = React.useState(false);

      return (
        <Box sx={{ minHeight: 500 }}>
          <RegionSelect
            {...args}
            handleSelection={() => setOpen(false)}
            open={open}
          />
        </Box>
      );
    };

    return SelectWrapper();
  },
};

const meta: Meta<RegionSelectProps> = {
  args: {
    disabled: false,
    errorText: '',
    helperText: '',
    isClearable: false,
    label: 'Region',
    regions,
    required: true,
    selectedId: regions[2].id,
  },
  component: RegionSelect,
  title: 'Components/Selects/Region Select',
};
export default meta;
