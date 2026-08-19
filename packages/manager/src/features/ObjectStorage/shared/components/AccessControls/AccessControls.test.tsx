import { screen, waitFor } from '@testing-library/react';
import * as React from 'react';

import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AccessControls } from './AccessControls';

import type { Props } from './AccessControls';
import type { ObjectStorageEndpointTypes } from '@linode/api-v4';

const CORS_ENABLED_TEXT = 'CORS Enabled';
const BUCKET_ACCESS_URL = '*object-storage/buckets/*/*/access';
const OBJECT_ACCESS_URL = '*object-storage/buckets/*/*/object-acl';

const defaultProps: Props = {
  regionId: 'in-maa',
  endpointType: 'E1',
  name: 'my-object-name',
  variant: 'bucket',
};

const renderComponent = (props: Partial<Props> = {}) =>
  renderWithTheme(<AccessControls {...defaultProps} {...props} />);

describe('AccessSelect', () => {
  it.each([
    ['bucket', 'E0', true],
    ['bucket', 'E1', true],
    ['bucket', 'E2', false],
    ['bucket', 'E3', false],
    ['object', 'E0', false],
    ['object', 'E1', false],
    ['object', 'E2', false],
    ['object', 'E3', false],
  ])(
    'shows correct UI for %s variant and %s endpoint type',
    async (variant, endpointType, shouldShowCORS) => {
      server.use(
        http.get(BUCKET_ACCESS_URL, () => {
          return HttpResponse.json({ acl: 'private', cors_enabled: true });
        }),
        http.get(OBJECT_ACCESS_URL, () => {
          return HttpResponse.json({ acl: 'private' });
        })
      );

      renderComponent({
        endpointType: endpointType as ObjectStorageEndpointTypes,
        variant: variant as 'bucket' | 'object',
      });

      const aclSelect = screen.getByTestId('acl-select') as any;
      expect(aclSelect.selected.label).toBe('Private');

      if (shouldShowCORS) {
        const corsSwitch = screen.getByTestId('cors-switch') as any;
        expect(corsSwitch.innerHTML).toEqual('Loading access...');

        await waitFor(() => {
          expect(corsSwitch.checked).toBe(true);
          expect(corsSwitch.innerHTML).toEqual(CORS_ENABLED_TEXT);
        });
      }
    }
  );

  it('updates the access and CORS settings and submits the appropriate values', async () => {
    server.use(
      http.get(BUCKET_ACCESS_URL, () => {
        return HttpResponse.json({ acl: 'private', cors_enabled: true });
      }),
      http.put(BUCKET_ACCESS_URL, () => {
        return HttpResponse.json({});
      })
    );

    renderComponent();

    const aclSelect = screen.getByTestId('acl-select') as any;
    const corsSwitch = screen.getByTestId('cors-switch') as any;
    const saveButton = screen.getByTestId('save-access-changes') as any;

    await waitFor(() => {
      expect(aclSelect.selected.label).toBe('Private');
      expect(corsSwitch.checked).toBe(true);
      expect(corsSwitch.innerHTML).toEqual(CORS_ENABLED_TEXT);
      expect(saveButton.disabled).toBe(true);
    });
  });
});
