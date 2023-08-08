import { getDNSZoneFile } from '@linode/api-v4/lib/domains';
import * as React from 'react';

import { Button } from 'src/components/Button/Button';
import { downloadFile } from 'src/utilities/downloadFile';

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
