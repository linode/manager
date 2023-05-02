import * as React from 'react';
import { LinkButton } from 'src/components/LinkButton';
import { useDNSZoneFileQuery } from 'src/queries/domains';

type Props = {
  id: number;
};

export const DownloadDNSZoneFileButton = ({ id }: Props) => {
  const { data } = useDNSZoneFileQuery(id);

  const handleClick = () => {
    const zoneFileContent = data?.zone_file.join('\n');
    if (zoneFileContent) {
      const blob = new Blob([zoneFileContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'DNSzonefile.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return <LinkButton onClick={handleClick}>Download DNS Zone File</LinkButton>;
};
