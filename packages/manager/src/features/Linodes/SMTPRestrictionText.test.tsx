import { waitFor } from '@testing-library/react';
import * as React from 'react';

import { MAGIC_DATE_THAT_EMAIL_RESTRICTIONS_WERE_IMPLEMENTED } from 'src/constants';
import { accountFactory } from 'src/factories/account';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  SMTPRestrictionText,
  SMTPRestrictionTextProps,
  accountCreatedAfterRestrictions,
} from './SMTPRestrictionText';

const defaultChildren = (props: { text: React.ReactNode }) => (
  <span>{props.text}</span>
);

const props: SMTPRestrictionTextProps = {
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
  it('should render when user account is created on or after the magic date', async () => {
    const account = accountFactory.build({
      active_since: MAGIC_DATE_THAT_EMAIL_RESTRICTIONS_WERE_IMPLEMENTED,
    });

    server.use(
      http.get('*/account', () => {
        return HttpResponse.json(account);
      })
    );

    const { findByText } = renderWithTheme(
      <SMTPRestrictionText
        supportLink={{ id: 0, label: 'Test Linode' }}
        {...props}
      />
    );

    await findByText('SMTP ports may be restricted on this Linode.', {
      exact: false,
    });
  });

  it('should not render when user account is created before the magic date', async () => {
    const account = accountFactory.build({
      active_since: '2022-11-27 00:00:00Z',
    });

    server.use(
      http.get('*/account', () => {
        return HttpResponse.json(account);
      })
    );

    const { queryByText } = renderWithTheme(
      <SMTPRestrictionText
        supportLink={{ id: 0, label: 'Test Linode' }}
        {...props}
      />
    );

    await waitFor(() =>
      expect(
        queryByText('SMTP ports may be restricted on this Linode.', {
          exact: false,
        })
      ).toBeNull()
    );
  });

  it('should default to not including a link to open a support ticket', () => {
    const account = accountFactory.build({
      active_since: MAGIC_DATE_THAT_EMAIL_RESTRICTIONS_WERE_IMPLEMENTED,
    });

    server.use(
      http.get('*/account', () => {
        return HttpResponse.json(account);
      })
    );

    const { getByText } = renderWithTheme(<SMTPRestrictionText {...props} />);

    expect(
      getByText('open a support ticket', { exact: false })
    ).not.toHaveAttribute('href', '/support/tickets');
  });

  it('should include a link to open a support ticket when the prop is provided', () => {
    const account = accountFactory.build({
      active_since: MAGIC_DATE_THAT_EMAIL_RESTRICTIONS_WERE_IMPLEMENTED,
    });

    server.use(
      http.get('*/account', () => {
        return HttpResponse.json(account);
      })
    );

    const { getByText } = renderWithTheme(
      <SMTPRestrictionText
        supportLink={{ id: 0, label: 'Test Linode' }}
        {...props}
      />
    );

    expect(getByText('open a support ticket')).toHaveAttribute(
      'href',
      '/support/tickets'
    );
  });
});
