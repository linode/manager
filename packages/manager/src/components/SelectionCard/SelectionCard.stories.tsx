import { Chip } from '@linode/ui';
import Alarm from '@mui/icons-material/Alarm';
import InsertPhoto from '@mui/icons-material/InsertPhoto';
import DE from 'flag-icons/flags/4x3/de.svg';
import US from 'flag-icons/flags/4x3/us.svg';
import * as React from 'react';

import { SelectionCard } from './SelectionCard';

import type { SelectionCardProps } from './SelectionCard';
import type { Meta, StoryObj } from '@storybook/react';

const iconOptions = {
  Alarm: () => <Alarm />,
  'Arch Linux': () => <span className="fl-archlinux" />,
  'DE Flag': () => <DE height="24" viewBox="0 0 640 480" width="32" />,
  Debian: () => <span className="fl-debian" />,
  None: () => null,
  Photo: () => <InsertPhoto />,
  'US Flag': () => <US height="24" viewBox="0 0 720 480" width="32" />,
};

const variantOptions = {
  Chip: () => <Chip component="span" label="DEFAULT" />,
  None: () => null,
};

export const Default: StoryObj<SelectionCardProps> = {
  render: (args) => {
    const SelectionCardWrapper = () => {
      const [checked, setChecked] = React.useState(false);

      const handleChange = () => {
        setChecked(!checked);
      };

      return (
        <SelectionCard {...args} checked={checked} onClick={handleChange} />
      );
    };

    return <SelectionCardWrapper />;
  },
};

const meta: Meta<SelectionCardProps> = {
  argTypes: {
    renderIcon: {
      control: {
        type: 'select',
      },
      mapping: iconOptions,
      options: Object.keys(iconOptions),
    },
    renderVariant: {
      control: {
        type: 'select',
      },
      mapping: variantOptions,
      options: Object.keys(variantOptions),
    },
  },
  args: {
    checked: false,
    disabled: false,
    heading: 'Photos',
    renderIcon: iconOptions.Photo,
    renderVariant: variantOptions.Chip,
    subheadings: ['Use a photo', 'Select up to 3'],
    tooltip: '',
  },
  component: SelectionCard,
  title: 'Components/SelectionCard',
};

export default meta;
