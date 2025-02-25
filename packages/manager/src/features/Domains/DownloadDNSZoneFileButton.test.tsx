import { downloadFile } from '@linode/utilities';
import { fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';

import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import { DownloadDNSZoneFileButton } from './DownloadDNSZoneFileButton';

vi.mock('@linode/api-v4/lib/domains', async () => {
  const actual = await vi.importActual<any>('@linode/api-v4/lib/domains');
  return {
    ...actual,
    getDNSZoneFile: vi.fn().mockResolvedValue({
      zone_file: [
        'example.com. 86400 IN SOA ns1.linode.com. test.example.com. 2013072519 14400 14400 1209600 86400',
      ],
    }),
  };
});

vi.mock('@linode/utilities', async () => {
  const actual = await vi.importActual<any>('@linode/utilities');
  return {
    ...actual,
    downloadFile: vi.fn(),
  };
});

describe('DownloadDNSZoneFileButton', () => {
  it('renders button text correctly', async () => {
    const { getByText } = await renderWithThemeAndRouter(
      <DownloadDNSZoneFileButton domainId={1} domainLabel="test.com" />
    );
    expect(getByText('Download DNS Zone File')).toBeInTheDocument();
  });

  it('downloads DNS zone file when button is clicked', async () => {
    const { getByText } = await renderWithThemeAndRouter(
      <DownloadDNSZoneFileButton domainId={1} domainLabel="test.com" />
    );
    fireEvent.click(getByText('Download DNS Zone File'));
    await waitFor(() => expect(downloadFile).toHaveBeenCalledTimes(1));
    expect(downloadFile).toHaveBeenCalledWith(
      'test.com.txt',
      'example.com. 86400 IN SOA ns1.linode.com. test.example.com. 2013072519 14400 14400 1209600 86400'
    );
  });
});
