import * as React from 'react';
import { accountCreatedAfterRestrictions } from './SMTPRestrictionText';
import SMTPRestrictionText, { Props } from './SMTPRestrictionText';
import { MAGIC_DATE_THAT_EMAIL_RESTRICTIONS_WERE_IMPLEMENTED } from 'src/constants';
import { accountFactory } from 'src/factories/account';
import { renderWithTheme } from 'src/utilities/testHelpers';

const defaultChildren = (props: { text: React.ReactNode }) => (
  <span>{props.text}</span>
);

let mockActiveSince = MAGIC_DATE_THAT_EMAIL_RESTRICTIONS_WERE_IMPLEMENTED;

jest.mock('../../queries/account', () => {
  return {
    useAccount: jest.fn(() => {
      const account = accountFactory.build({
        active_since: mockActiveSince,
      });
      return { data: account };
    }),
  };
});

const props: Props = {
  children: defaultChildren,
};

describe('accountCreatedAfterRestrictions', () => {
  it('defaults to true with bad/no input', () => {
    expect(accountCreatedAfterRestrictions()).toBe(true);
    expect(accountCreatedAfterRestrictions('not a date!')).toBe(true);
  });

  it('only returns true when the account was created after the magic date', () => {
    expect(accountCreatedAfterRestrictions('2022-11-27 00:00:00Z')).toBe(false);
    expect(accountCreatedAfterRestrictions('2022-11-29 23:59:59Z')).toBe(false);
    expect(
      accountCreatedAfterRestrictions(
        MAGIC_DATE_THAT_EMAIL_RESTRICTIONS_WERE_IMPLEMENTED
      )
    ).toBe(true);
    expect(accountCreatedAfterRestrictions('2022-11-30 00:00:01Z')).toBe(true);
  });
});

describe('SMTPRestrictionText component', () => {
  it('should render when user account is created on or after the magic date', () => {
    mockActiveSince = MAGIC_DATE_THAT_EMAIL_RESTRICTIONS_WERE_IMPLEMENTED;

    const { getByText } = renderWithTheme(
      <SMTPRestrictionText
        supportLink={{ label: 'Test Linode', id: 0 }}
        {...props}
      />
    );

    expect(
      getByText('SMTP ports may be restricted on this Linode.', {
        exact: false,
      })
    ).toBeVisible();
  });

  it('should not render when user account is created before the magic date', () => {
    mockActiveSince = '2022-11-27 00:00:00Z';

    const { queryByText } = renderWithTheme(
      <SMTPRestrictionText
        supportLink={{ label: 'Test Linode', id: 0 }}
        {...props}
      />
    );

    expect(
      queryByText('SMTP ports may be restricted on this Linode.', {
        exact: false,
      })
    ).toBeNull();
  });

  it('should default to not including a link to open a support ticket', () => {
    mockActiveSince = MAGIC_DATE_THAT_EMAIL_RESTRICTIONS_WERE_IMPLEMENTED;

    const { getByText } = renderWithTheme(<SMTPRestrictionText {...props} />);

    expect(
      getByText('open a support ticket', { exact: false })
    ).not.toHaveAttribute('href', '/support/tickets');
  });

  it('should include a link to open a support ticket when the prop is provided', () => {
    mockActiveSince = MAGIC_DATE_THAT_EMAIL_RESTRICTIONS_WERE_IMPLEMENTED;

    const { getByText } = renderWithTheme(
      <SMTPRestrictionText
        supportLink={{ label: 'Test Linode', id: 0 }}
        {...props}
      />
    );

    expect(getByText('open a support ticket')).toHaveAttribute(
      'href',
      '/support/tickets'
    );
  });
});
