import React from 'react';

import { CodeBlock } from './CodeBlock';

import type { Meta, StoryObj } from '@storybook/react';

const code = `/**
  * Given a user's preference (light | dark | system), get the name of the actual
  * theme we should use
  */
export const getThemeFromPreferenceValue = (
  value: unknown,
  isSystemInDarkMode: boolean
): ThemeName => {
  const systemTheme = isSystemInDarkMode ? 'dark' : 'light';
  if (value === 'system') {
    return systemTheme;
  }
  if (isValidTheme(value)) {
    return value as ThemeName;
  }
  return systemTheme;
};`;

const meta: Meta<typeof CodeBlock> = {
  args: {
    code,
    language: 'typescript',
  },
  component: CodeBlock,
  title: 'Components/CodeBlock',
};

export default meta;

type Story = StoryObj<typeof CodeBlock>;

export const Default: Story = {
  render: (args) => <CodeBlock {...args} />,
};
