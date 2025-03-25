import { getDNSZoneFile } from '@linode/api-v4/lib/domains';
import { Button } from '@linode/ui';
import { downloadFile } from '@linode/utilities';
import * as React from 'react';

type DownloadDNSZoneFileButtonProps = {
  domainId: number;
  domainLabel: string;
};

export const DownloadDNSZoneFileButton = (
  props: DownloadDNSZoneFileButtonProps
) => {
  const { domainId, domainLabel } = props;

  const handleClick = async () => {
    const data = await getDNSZoneFile(domainId);
    const zoneFileContent = data?.zone_file.join('\n');
    if (zoneFileContent) {
      downloadFile(`${domainLabel}.txt`, zoneFileContent);
    }
  };

  return (
    <Button buttonType="secondary" onClick={handleClick}>
      Download DNS Zone File
    </Button>
  );
};
