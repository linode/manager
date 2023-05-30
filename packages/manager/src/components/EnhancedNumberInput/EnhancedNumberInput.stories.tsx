import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { EnhancedNumberInput } from 'src/components/EnhancedNumberInput/EnhancedNumberInput';

const meta: Meta<typeof EnhancedNumberInput> = {
  title: 'Components/EnhancedNumberInput',
  component: EnhancedNumberInput,
  argTypes: {
    max: {
      control: {
        type: 'number',
        max: 100,
        min: 0,
      },
    },
    min: {
      control: {
        type: 'number',
        min: 0,
        max: 100,
      },
    },
    value: {
      control: {
        type: 'number',
        min: 0,
        max: 100,
      },
    },
  },
  args: {},
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

  return <EnhancedNumberInput {...props} value={value} setValue={onChange} />;
};
