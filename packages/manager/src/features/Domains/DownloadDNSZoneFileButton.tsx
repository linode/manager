import * as React from 'react';
import { LinkButton } from 'src/components/LinkButton';
import { downloadFile } from 'src/utilities/downloadFile';
import { getDNSZoneFile } from '@linode/api-v4/lib/domains';

type Props = {
  id: number;
};

export const DownloadDNSZoneFileButton = ({ id }: Props) => {
  const handleClick = async () => {
    const data = await getDNSZoneFile(id);
    const zoneFileContent = data?.zone_file.join('\n');
    if (zoneFileContent) {
      downloadFile(`${domain}.txt`, zoneFileContent);
    }
  };

  return <LinkButton onClick={handleClick}>Download DNS Zone File</LinkButton>;
};
