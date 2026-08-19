import { streamType } from '@linode/api-v4';
import { screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, it, vi } from 'vitest';

import { accountFactory } from 'src/factories';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { PathSample } from './PathSample';

interface TestFormValues {
  stream: {
    details?: {
      cluster_ids?: string[];
    };
    type: string;
  };
}

const fileName = 'akamai_log-000166-1756015362-319597-login.gz';

const renderComponent = (value: string) => {
  return renderWithThemeAndHookFormContext<TestFormValues>({
    component: <PathSample value={value} />,
    useFormOptions: {
      defaultValues: {
        stream: {
          type: streamType.AuditLogs,
        },
      },
    },
  });
};

describe('PathSample', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('when prefix is provided', () => {
    it.each([
      ['test', '/test/akamai_log-000166-1756015362-319597-login.gz'],
      ['/test', '/test/akamai_log-000166-1756015362-319597-login.gz'],
      ['/', '/akamai_log-000166-1756015362-319597-login.gz'],
    ])(
      'should generate correct path for prefix "%s"',
      (value, expectedPath) => {
        renderComponent(value);

        screen.getByText(expectedPath);
      }
    );
  });

  describe('when no prefix is provided', () => {
    it('should generate default path including account euuid and current date', async () => {
      const accountEuuid = 'TEST-ACCOUNT-EUUID';
      vi.spyOn(Date.prototype, 'toLocaleDateString').mockReturnValue(
        '7/28/2026'
      );

      server.use(
        http.get('*/account', () =>
          HttpResponse.json(accountFactory.build({ euuid: accountEuuid }))
        )
      );

      renderComponent('');

      await screen.findByText(
        `/audit_logs/com.akamai.audit/${accountEuuid}/2026/7/28/${fileName}`
      );
    });
  });
});
