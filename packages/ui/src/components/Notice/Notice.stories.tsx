import { Paper, Typography } from '@linode/ui';
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

export const Tip: StoryObj<NoticeProps> = {
  render: (args) => (
    <Notice {...args} text="This is a tip notice" variant="tip" />
  ),
};

export const InfoWithLongTextAndMarkup: StoryObj<NoticeProps> = {
  render: () => (
    <Notice variant="info">
      <Typography variant="h2">
        This is a informational notice with a title.
      </Typography>
      <Typography>This paragraph under the title should wrap.</Typography>
    </Notice>
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

export const WarningInsidePaper: StoryObj<NoticeProps> = {
  render: (args) => (
    <Paper>
      <Notice
        {...args}
        text="This is a warning notice inside a paper"
        variant="warning"
      />
    </Paper>
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
