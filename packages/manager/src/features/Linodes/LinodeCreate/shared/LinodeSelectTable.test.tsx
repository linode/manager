import { linodeFactory, regionFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { makeResourcePage } from 'src/mocks/serverHandlers';
import { server } from 'src/mocks/testServer';
import {
  mockMatchMedia,
  renderWithThemeAndHookFormContext,
} from 'src/utilities/testHelpers';

import { getLinodeXFilter, LinodeSelectTable } from './LinodeSelectTable';

beforeAll(() => mockMatchMedia());

const queryMocks = vi.hoisted(() => ({
  useIsDiskEncryptionFeatureEnabled: vi.fn(() => ({
    isDiskEncryptionFeatureEnabled: false,
  })),
  useNavigate: vi.fn(),
  useParams: vi.fn(),
  useSearch: vi.fn(),
  userPermissions: vi.fn(() => ({
    data: {
      clone_linode: true,
      create_linode: true,
    },
  })),
}));

vi.mock('src/components/Encryption/utils', () => ({
  useIsDiskEncryptionFeatureEnabled:
    queryMocks.useIsDiskEncryptionFeatureEnabled,
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
    useSearch: queryMocks.useSearch,
    useParams: queryMocks.useParams,
  };
});

describe('Linode Select Table', () => {
  beforeEach(() => {
    queryMocks.useNavigate.mockReturnValue(vi.fn());
    queryMocks.useSearch.mockReturnValue({});
    queryMocks.useParams.mockReturnValue({});
  });

  it('should filter out Linodes in distributed regions', () => {
    const { filter } = getLinodeXFilter('');

    expect(filter).toHaveProperty('site_type', 'core');
  });

  it('should search for label, id, ipv4, tags', () => {
    const { filter } = getLinodeXFilter('12345678');

    expect(filter).toStrictEqual({
      '+or': [
        { label: { '+contains': '12345678' } },
        { id: { '+contains': '12345678' } },
        { ipv4: { '+contains': '12345678' } },
        { tags: { '+contains': '12345678' } },
      ],
      site_type: 'core',
    });
  });

  it('should return an error if the x-filter is invalid', () => {
    const { filterError } = getLinodeXFilter('123 456');

    expect(filterError).toHaveProperty(
      'message',
      `Expected "!=", "<", "<=", "=", ">", ">=", [:~], or whitespace but "4" found.`
    );
  });

  it('should render Linodes from the API', async () => {
    const linodes = linodeFactory.buildList(10);

    server.use(
      http.get('*/linode/instances*', () => {
        return HttpResponse.json(makeResourcePage(linodes));
      })
    );

    const { findByText } = renderWithThemeAndHookFormContext({
      component: <LinodeSelectTable />,
    });

    for (const linode of linodes) {
      await findByText(linode.label);
    }
  });

  it('should select a linode based on form state', async () => {
    const selectedLinode = linodeFactory.build({
      id: 1,
      label: 'my-selected-linode',
    });

    server.use(
      http.get('*/linode/instances*', () => {
        return HttpResponse.json(makeResourcePage([selectedLinode]));
      })
    );

    const { findByLabelText } = renderWithThemeAndHookFormContext({
      component: <LinodeSelectTable />,
      useFormOptions: {
        defaultValues: { linode: selectedLinode },
      },
    });

    const radio = await findByLabelText(selectedLinode.label);

    expect(radio).toBeEnabled();
    expect(radio).toBeChecked();
  });

  it('should set disk_encryption to enabled when selecting a linode in a region that supports it', async () => {
    queryMocks.useIsDiskEncryptionFeatureEnabled.mockReturnValue({
      isDiskEncryptionFeatureEnabled: true,
    });

    const region = regionFactory.build({
      capabilities: ['Linodes', 'Disk Encryption'],
      site_type: 'core',
    });

    const linode = linodeFactory.build({
      id: 1,
      label: 'my-encrypted-linode',
      region: region.id,
    });

    server.use(
      http.get('*/v4*/regions', () => {
        return HttpResponse.json(makeResourcePage([region]));
      }),
      http.get('*/linode/instances*', () => {
        return HttpResponse.json(makeResourcePage([linode]));
      })
    );

    // Helper to observe react-hook-form state since renderWithThemeAndHookFormContext doesn't expose form methods
    const FormValueDisplay = () => {
      const { watch } = useFormContext();
      return (
        <span data-testid="disk-encryption">{watch('disk_encryption')}</span>
      );
    };

    const { findByLabelText, getByTestId } = renderWithThemeAndHookFormContext({
      component: (
        <>
          <LinodeSelectTable />
          <FormValueDisplay />
        </>
      ),
    });

    const radio = await findByLabelText(linode.label);
    await userEvent.click(radio);

    await waitFor(() => {
      expect(getByTestId('disk-encryption')).toHaveTextContent('enabled');
    });
  });

  it('should not set disk_encryption to enabled when selecting a linode in a region that does not support it', async () => {
    queryMocks.useIsDiskEncryptionFeatureEnabled.mockReturnValue({
      isDiskEncryptionFeatureEnabled: true,
    });

    const region = regionFactory.build({
      capabilities: ['Linodes'],
      site_type: 'core',
    });

    const linode = linodeFactory.build({
      id: 1,
      label: 'my-unencrypted-linode',
      region: region.id,
    });

    server.use(
      http.get('*/v4*/regions', () => {
        return HttpResponse.json(makeResourcePage([region]));
      }),
      http.get('*/linode/instances*', () => {
        return HttpResponse.json(makeResourcePage([linode]));
      })
    );

    const FormValueDisplay = () => {
      const { watch } = useFormContext();
      return (
        <span data-testid="disk-encryption">
          {watch('disk_encryption') ?? 'disabled'}
        </span>
      );
    };

    const { findByLabelText, getByTestId } = renderWithThemeAndHookFormContext({
      component: (
        <>
          <LinodeSelectTable />
          <FormValueDisplay />
        </>
      ),
    });

    const radio = await findByLabelText(linode.label);
    await userEvent.click(radio);

    // disk_encryption should remain 'disabled' since the region lacks the capability
    await waitFor(() => {
      expect(getByTestId('disk-encryption')).toHaveTextContent('disabled');
    });
  });
});
