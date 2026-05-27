import { sharegroupTokenFactory } from '@linode/utilities';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { wrapWithTableBody } from 'src/utilities/testHelpers';

import { JoinedOrRequestedGroupRow } from './JoinedOrRequestedGroupRow';

import type { SharegroupToken } from '@linode/api-v4';

const queryMocks = vi.hoisted(() => ({
  usePreferences: vi.fn().mockReturnValue({ data: undefined }),
  useProfile: vi.fn().mockReturnValue({ data: { timezone: 'UTC' } }),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    usePreferences: queryMocks.usePreferences,
    useProfile: queryMocks.useProfile,
  };
});

vi.mock('src/features/Profile/Settings/TableStriping.utils', () => ({
  getIsTableStripingEnabled: vi.fn().mockReturnValue(false),
}));

// Always render Hidden children so we can test the status-changed column
vi.mock('@linode/ui', async () => {
  const actual = await vi.importActual('@linode/ui');
  return {
    ...actual,
    Hidden: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

vi.mock('@akamai/compute-ui-core/datetime', () => ({
  formatDate: vi.fn().mockReturnValue('January 1, 2025'),
}));

const renderRow = (joinedGroup?: SharegroupToken) => {
  const group = joinedGroup ?? sharegroupTokenFactory.build();
  return render(
    wrapWithTableBody(<JoinedOrRequestedGroupRow joinedGroup={group} />)
  );
};

describe('Joined Group row', () => {
  describe('sharegroup label', () => {
    it('renders the label as a link button when present', () => {
      const joinedGroup = sharegroupTokenFactory.build({
        sharegroup_label: 'My Share Group',
      });

      const { getByRole } = renderRow(joinedGroup);

      expect(getByRole('button', { name: 'My Share Group' })).toBeVisible();
    });

    it('renders "–" when sharegroup_label is an empty string', () => {
      const joinedGroup = sharegroupTokenFactory.build({
        sharegroup_label: '',
      });

      const { getByText } = renderRow(joinedGroup);

      expect(getByText('–')).toBeVisible();
    });

    it('truncates labels longer than 32 characters', () => {
      // 33 characters — should be truncated to 29 chars + '...'
      const longLabel = 'This is a very long group label!!';
      const joinedGroup = sharegroupTokenFactory.build({
        sharegroup_label: longLabel,
      });

      const { getByRole } = renderRow(joinedGroup);

      expect(
        getByRole('button', { name: 'This is a very long group lab...' })
      ).toBeVisible();
    });

    it('shows the full label in a tooltip when label is longer than 32 characters', async () => {
      const veryLongLabel = 'This is a very long group label!!'; // 33 chars
      const joinedGroup = sharegroupTokenFactory.build({
        sharegroup_label: veryLongLabel,
      });

      const { getByRole, findByText } = renderRow(joinedGroup);

      await userEvent.hover(
        getByRole('button', { name: 'This is a very long group lab...' })
      );

      expect(await findByText(veryLongLabel)).toBeVisible();
    });

    it('does not show a tooltip when the label is 32 characters or fewer', async () => {
      const shortLabel = 'Short Label';
      const joinedGroup = sharegroupTokenFactory.build({
        sharegroup_label: shortLabel,
      });

      const { getByRole, queryByRole } = renderRow(joinedGroup);

      await userEvent.hover(getByRole('button', { name: shortLabel }));

      expect(queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('membership status', () => {
    it('renders the status in capitalized form', () => {
      const joinedGroup = sharegroupTokenFactory.build({ status: 'pending' });

      const { getByText } = renderRow(joinedGroup);

      expect(getByText('Pending')).toBeVisible();
    });

    it('renders the active status as "Active"', () => {
      const joinedGroup = sharegroupTokenFactory.build({ status: 'active' });

      const { getByText } = renderRow(joinedGroup);

      expect(getByText('Active')).toBeVisible();
    });
  });

  describe('status changed date', () => {
    it('renders the formatted updated date when updated is not null', () => {
      const joinedGroup = sharegroupTokenFactory.build({
        updated: '2025-01-01T00:00:00',
      });

      const { getByText } = renderRow(joinedGroup);

      expect(getByText('January 1, 2025')).toBeVisible();
    });

    it('renders "–" when updated is null', () => {
      const joinedGroup = sharegroupTokenFactory.build({
        updated: null as unknown as string,
      });

      const { getByText } = renderRow(joinedGroup);

      expect(getByText('–')).toBeVisible();
    });
  });

  describe('leave group action', () => {
    it('renders a "Leave Group" button', () => {
      const { getByRole } = renderRow();

      expect(getByRole('button', { name: 'Leave Group' })).toBeVisible();
    });
  });

  describe('row attributes', () => {
    it('sets data-qa-joinedgroup-row to the token_uuid', () => {
      const joinedGroup = sharegroupTokenFactory.build({
        token_uuid: 'test-token-uuid',
      });

      const { container } = renderRow(joinedGroup);

      expect(
        container.querySelector('[data-qa-joinedgroup-row="test-token-uuid"]')
      ).toBeInTheDocument();
    });
  });
});

describe('Membership Request row', () => {
  const requestedGroup = sharegroupTokenFactory.build({
    created: '2026-01-01T00:00:00',
    expiry: '2026-01-15T00:00:00',
    sharegroup_uuid: null as unknown as string,
    status: 'pending',
    token_uuid: 'test-token-uuid',
    valid_for_sharegroup_uuid: 'abcdefg-12345',
  });

  describe('Share Group UUID', () => {
    it('renders the Share Group UUID with a copy icon', () => {
      const { container, getByText } = renderRow(requestedGroup);
      expect(getByText('abcdefg-12345')).toBeVisible();

      const copyIcon = container.querySelector(
        '[data-pendo-id="Images Groups Membership Requests-Share Group UUID copy"]'
      );
      expect(copyIcon).toBeInTheDocument();
    });
  });

  describe('Token UUID', () => {
    it('renders the Token UUID with a copy icon', () => {
      const { container, getByText } = renderRow(requestedGroup);
      expect(getByText('test-token-uuid')).toBeVisible();

      const copyIcon = container.querySelector(
        '[data-pendo-id="Images Groups Membership Requests-Token UUID copy"]'
      );
      expect(copyIcon).toBeInTheDocument();
    });
  });

  describe('Status', () => {
    it('renders the status as "Pending"', () => {
      const { getByText } = renderRow(requestedGroup);
      expect(getByText('Pending')).toBeVisible();
    });
  });

  describe('Cancel Request action', () => {
    it('renders a "Cancel Request" button', () => {
      const { getByRole } = renderRow(requestedGroup);

      expect(getByRole('button', { name: 'Cancel' })).toBeVisible();
    });
  });
});
