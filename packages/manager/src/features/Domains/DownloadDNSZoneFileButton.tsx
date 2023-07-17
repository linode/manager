import { getDNSZoneFile } from '@linode/api-v4/lib/domains';
import * as React from 'react';

import { Button } from 'src/components/Button/Button';
import { downloadFile } from 'src/utilities/downloadFile';

type Props = {
  domainId: number;
  domainLabel: string;
};

export const DownloadDNSZoneFileButton = ({ domainId, domainLabel }: Props) => {
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
