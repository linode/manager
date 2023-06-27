import * as React from 'react';
import Alarm from '@mui/icons-material/Alarm';
import InsertPhoto from '@mui/icons-material/InsertPhoto';
import DE from 'flag-icons/flags/4x3/de.svg';
import US from 'flag-icons/flags/4x3/us.svg';
import { Chip } from 'src/components/core/Chip';
import { SelectionCard } from './SelectionCard';
import type { Meta, StoryObj } from '@storybook/react';
import type { SelectionCardProps } from './SelectionCard';

const iconOptions = {
  None: () => null,
  Photo: () => <InsertPhoto />,
  Alarm: () => <Alarm />,
  'DE Flag': () => <DE width="32" height="24" viewBox="0 0 640 480" />,
  'US Flag': () => <US width="32" height="24" viewBox="0 0 720 480" />,
  'Arch Linux': () => <span className="fl-archlinux" />,
  Debian: () => <span className="fl-debian" />,
};

const variantOptions = {
  None: () => null,
  Chip: () => <Chip label="DEFAULT" component="span" />,
};

export const Default: StoryObj<SelectionCardProps> = {
  render: (args) => <SelectionCard {...args} />,
};

const meta: Meta<SelectionCardProps> = {
  title: 'Components/SelectionCard',
  component: SelectionCard,
  args: {
    heading: 'Photos',
    subheadings: ['Use a photo', 'Select up to 3'],
    checked: false,
    disabled: false,
    renderIcon: iconOptions.Photo,
    renderVariant: variantOptions.Chip,
    tooltip: '',
  },
  argTypes: {
    renderIcon: {
      control: { type: 'select' },
      options: iconOptions,
    },
    renderVariant: {
      control: { type: 'select' },
      options: variantOptions,
    },
  },
};

export default meta;
