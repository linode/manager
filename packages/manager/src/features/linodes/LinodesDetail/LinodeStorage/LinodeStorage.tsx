import * as React from 'react';
import LinodeDisks from '../LinodeAdvanced/LinodeDisks_CMR';
import LinodeVolumes from 'src/features/linodes/LinodesDetail/LinodeAdvanced/LinodeVolumes';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';

interface Props {
  linodeLabel?: string;
}

export const LinodeStorage: React.FC<Props> = props => {
  const { linodeLabel } = props;

  return (
    <>
      <DocumentTitleSegment
        segment={`${linodeLabel ? `${linodeLabel} - ` : ''} Storage`}
      />
      <LinodeDisks />
      <LinodeVolumes />
    </>
  );
};

export default LinodeStorage;
