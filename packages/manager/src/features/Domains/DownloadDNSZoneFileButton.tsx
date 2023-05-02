import * as React from 'react';
import { LinkButton } from 'src/components/LinkButton';
import { useDNSZoneFileQuery } from 'src/queries/domains';
import { downloadFile } from 'src/utilities/downloadFile';

type Props = {
  id: number;
};

export const DownloadDNSZoneFileButton = ({ id }: Props) => {
  const { data } = useDNSZoneFileQuery(id);

  const handleClick = () => {
    const zoneFileContent = data?.zone_file.join('\n');
    if (zoneFileContent) {
      downloadFile('DNSzonefile.txt', zoneFileContent);
    }
  };

  return <LinkButton onClick={handleClick}>Download DNS Zone File</LinkButton>;
};
