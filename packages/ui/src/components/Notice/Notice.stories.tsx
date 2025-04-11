import { styled } from '@mui/material/styles';
import React from 'react';

import { Notice } from './Notice';

import type { NoticeProps } from './Notice';
import type { Meta, StoryObj } from '@storybook/react';

export const Success: StoryObj<NoticeProps> = {
  render: (args) => (
    <Notice {...args} text="This is a success notice" variant="success" />
  ),
};

export const Info: StoryObj<NoticeProps> = {
  render: (args) => (
    <Notice {...args} text="This is a informational notice" variant="info" />
  ),
};

export const Error: StoryObj<NoticeProps> = {
  render: (args) => (
    <Notice {...args} text="This is an error notice" variant="error" />
  ),
};

export const Warning: StoryObj<NoticeProps> = {
  render: (args) => (
    <Notice {...args} text="This is a warning notice" variant="warning" />
  ),
};

export const ImportantSuccess: StoryObj<NoticeProps> = {
  render: (args) => (
    <Notice
      {...args}
      important
      text="This is an important success notice"
      variant="success"
    />
  ),
};

export const ImportantInfo: StoryObj<NoticeProps> = {
  render: (args) => (
    <Notice
      {...args}
      important
      text="This is an important informational notice"
      variant="info"
    />
  ),
};

export const ImportantError: StoryObj<NoticeProps> = {
  render: (args) => (
    <Notice
      {...args}
      important
      text="This is an important error notice"
      variant="error"
    />
  ),
};

export const ImportantWarning: StoryObj<NoticeProps> = {
  render: (args) => (
    <Notice
      {...args}
      important
      text="This is an important warning notice"
      variant="warning"
    />
  ),
};

const meta: Meta<NoticeProps> = {
  args: {
    text: 'This is a notice',
  },
  component: Notice,
  decorators: [
    (Story) => (
      <StyledWrapper>
        <Story />
      </StyledWrapper>
    ),
  ],
  title: 'Components/Notifications/Notices',
};
export default meta;

const StyledWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
}));
