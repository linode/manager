import * as React from 'react';
import { Button } from 'src/components/Button/Button';
import { downloadFile } from 'src/utilities/downloadFile';
import { getDNSZoneFile } from '@linode/api-v4/lib/domains';

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
    <Button onClick={handleClick} buttonType="secondary">
      Download DNS Zone File
    </Button>
  );
};
