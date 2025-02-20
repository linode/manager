import React from 'react';

import { Markdown } from './Markdown';

import type { Meta, StoryObj } from '@storybook/react';

const markdown = `
# h1 Heading
## h2 Heading
### h3 Heading
#### h4 Heading
##### h5 Heading
###### h6 Heading

**This is bold text**

*This is italic text*

1. Make my changes
    1. Fix bug
    2. Improve formatting
        - Make the headings bigger
2. Push my commits to GitHub
3. Open a pull request
    * Describe my changes
    * Mention all the members of my team
        * Ask for feedback

This in inline \`testing\` code

\`\`\`js
const fetchData = async (): Promise => {
  // ...
};
\`\`\`

| Month    | Savings |
| -------- | ------- |
| January  | $250    |
| February | $80     |
| March    | $420    |
`;

const meta: Meta<typeof Markdown> = {
  args: {
    textOrMarkdown: markdown,
  },
  component: Markdown,
  title: 'Components/Markdown',
};

export default meta;

type Story = StoryObj<typeof Markdown>;

export const Default: Story = {
  render: (args) => <Markdown {...args} />,
};
