import * as React from 'react';
import { fireEvent, waitFor } from '@testing-library/react';
import { DownloadDNSZoneFileButton } from './DownloadDNSZoneFileButton';
import { downloadFile } from 'src/utilities/downloadFile';
import { renderWithTheme } from 'src/utilities/testHelpers';

jest.mock('@linode/api-v4/lib/domains', () => ({
  getDNSZoneFile: jest.fn().mockResolvedValue({
    zone_file: [
      'example.com. 86400 IN SOA ns1.linode.com. test.example.com. 2013072519 14400 14400 1209600 86400',
    ],
  }),
}));

jest.mock('src/utilities/downloadFile', () => ({
  downloadFile: jest.fn(),
}));

describe('DownloadDNSZoneFileButton', () => {
  it('renders button text correctly', () => {
    const { getByText } = renderWithTheme(
      <DownloadDNSZoneFileButton domainLabel="test.com" domainId={1} />
    );
    expect(getByText('Download DNS Zone File')).toBeInTheDocument();
  });

  it('downloads DNS zone file when button is clicked', async () => {
    const { getByText } = renderWithTheme(
      <DownloadDNSZoneFileButton domainLabel="test.com" domainId={1} />
    );
    fireEvent.click(getByText('Download DNS Zone File'));
    await waitFor(() => expect(downloadFile).toHaveBeenCalledTimes(1));
    expect(downloadFile).toHaveBeenCalledWith(
      'test.com.txt',
      'example.com. 86400 IN SOA ns1.linode.com. test.example.com. 2013072519 14400 14400 1209600 86400'
    );
  });
});
