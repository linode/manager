import { linodeFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import * as React from 'react';

import { accountFactory } from 'src/factories/account';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { SMTPRestrictionText } from './SMTPRestrictionText';

import type { SMTPRestrictionTextProps } from './SMTPRestrictionText';

const defaultChildren = (props: { text: React.ReactNode }) => (
  <span>{props.text}</span>
);

const props: SMTPRestrictionTextProps = {
  children: defaultChildren,
};

describe('SMTPRestrictionText component', () => {
  it('should not render for an account with the "SMTP Enabled" capability', async () => {
    const account = accountFactory.build({
      capabilities: ['SMTP Enabled'],
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

  it('should not render for a Linode with the "SMTP Enabled" capability', async () => {
    const account = accountFactory.build();

    server.use(
      http.get('*/account', () => {
        return HttpResponse.json(account);
      })
    );

    const { queryByText } = renderWithTheme(
      <SMTPRestrictionText
        linode={linodeFactory.build({ capabilities: ['SMTP Enabled'] })}
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
    const account = accountFactory.build();

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
    const account = accountFactory.build();

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
      '/support/tickets/open?dialogOpen=true'
    );
  });
});
