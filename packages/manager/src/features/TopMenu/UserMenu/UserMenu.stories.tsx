import * as React from 'react';

import { UserMenu } from './UserMenu';

import type { Meta, StoryObj } from '@storybook/react';

export const Default: StoryObj<typeof UserMenu> = {
  render: () => <UserMenu />,
};

export const Open: StoryObj<typeof UserMenu> = {
  render: () => {
    const UserMenuWrapper = () => {
      const ref = React.useRef<any>(null);

      React.useEffect(() => {
        return ref.current?.firstChild?.click();
      }, []);

      return (
        <div ref={ref}>
          <UserMenu />
        </div>
      );
    };

    return UserMenuWrapper();
  },
};

const meta: Meta<typeof UserMenu> = {
  component: UserMenu,
  title: 'Features/Navigation/User Menu',
};
export default meta;
