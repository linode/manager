import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AccessSelect } from './AccessSelect';

import type { Props } from './AccessSelect';
import type { ObjectStorageEndpointTypes } from '@linode/api-v4';

const CORS_ENABLED_TEXT = 'CORS Enabled';
const AUTHENTICATED_READ_TEXT = 'Authenticated Read';
const BUCKET_ACCESS_URL = '*object-storage/buckets/*/*/access';
const OBJECT_ACCESS_URL = '*object-storage/buckets/*/*/object-acl';

const defaultProps: Props = {
  clusterOrRegion: 'in-maa',
  endpointType: 'E1',
  name: 'my-object-name',
  variant: 'bucket',
};

describe('AccessSelect', () => {
  const renderComponent = (props: Partial<Props> = {}) =>
    renderWithTheme(<AccessSelect {...defaultProps} {...props} />, {
      flags: { objectStorageGen2: { enabled: true } },
    });

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

      const aclSelect = screen.getByRole('combobox');
      await waitFor(() => {
        expect(aclSelect).toBeEnabled();
        expect(aclSelect).toHaveValue('Private');
      });

      act(() => {
        fireEvent.click(aclSelect);
        fireEvent.change(aclSelect, { target: { value: 'P' } });
      });

      expect(screen.getByText('Private').closest('li')).toHaveAttribute(
        'aria-selected',
        'true'
      );
      if (shouldShowCORS) {
        await waitFor(() => {
          expect(screen.getByLabelText(CORS_ENABLED_TEXT)).toBeInTheDocument();
        });
        await waitFor(() => {
          expect(
            screen.getByRole('checkbox', { name: CORS_ENABLED_TEXT })
          ).toBeChecked();
        });
      } else {
        await waitFor(() => {
          expect(
            screen.queryByLabelText(CORS_ENABLED_TEXT)
          ).not.toBeInTheDocument();
        });
      }
    }
  );

  it('updates the access and CORS settings and submits the appropriate values', async () => {
    renderComponent();

    server.use(
      http.get(BUCKET_ACCESS_URL, () => {
        return HttpResponse.json({ acl: 'private', cors_enabled: true });
      }),
      http.put(BUCKET_ACCESS_URL, () => {
        return HttpResponse.json({});
      })
    );

    const aclSelect = screen.getByRole('combobox');
    const saveButton = screen.getByText('Save').closest('button')!;

    await waitFor(
      () => {
        expect(aclSelect).toBeEnabled();
        expect(aclSelect).toHaveValue('Private');
      },
      { interval: 100, timeout: 5000 }
    );

    // Wait for CORS toggle to appear and be checked
    const corsToggle = await screen.findByRole('checkbox', {
      name: CORS_ENABLED_TEXT,
    });
    expect(corsToggle).toBeChecked();

    act(() => {
      // Open the dropdown
      fireEvent.click(aclSelect);

      // Type to filter options
      fireEvent.change(aclSelect, {
        target: { value: AUTHENTICATED_READ_TEXT },
      });
    });

    // Wait for and select the "Authenticated Read" option
    const authenticatedReadOption = await screen.findByText(
      AUTHENTICATED_READ_TEXT
    );
    await userEvent.click(authenticatedReadOption);

    await userEvent.click(corsToggle);

    await waitFor(() => {
      expect(aclSelect).toHaveValue(AUTHENTICATED_READ_TEXT);
      expect(corsToggle).not.toBeChecked();
      expect(saveButton).toBeEnabled();
    });

    await userEvent.click(saveButton);
    await waitFor(() =>
      screen.findByText('Bucket access updated successfully.')
    );
  });
});
