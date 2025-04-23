import { action } from '@storybook/addon-actions';
import React from 'react';

import { EnhancedNumberInput } from 'src/components/EnhancedNumberInput/EnhancedNumberInput';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof EnhancedNumberInput> = {
  argTypes: {
    max: {
      control: {
        max: 100,
        min: 0,
        type: 'number',
      },
    },
    min: {
      control: {
        max: 100,
        min: 0,
        type: 'number',
      },
    },
    value: {
      control: {
        max: 100,
        min: 0,
        type: 'number',
      },
    },
  },
  args: {},
  component: EnhancedNumberInput,
  title: 'Components/Input/EnhancedNumberInput',
};

export default meta;

type Story = StoryObj<typeof EnhancedNumberInput>;

export const Default: Story = {
  args: {
    disabled: false,
    inputLabel: undefined,
    max: 100,
    min: 1,
    setValue: action('setValue'),
    value: 3,
  },
  decorators: [
    (Story, args) => {
      return (
        <div style={{ margin: '10px' }}>
          <Story />
        </div>
      );
    },
  ],
  render: (args) => <DefaultExample {...args} />,
};

const DefaultExample = (props: any) => {
  const [value, setValue] = React.useState(props.value);

  const onChange = (value: number) => {
    setValue(value);
  };

  return <EnhancedNumberInput {...props} setValue={onChange} value={value} />;
};
