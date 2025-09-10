import * as React from 'react';

import { EntityDetail } from 'src/components/EntityDetail/EntityDetail';

import { VolumeEntityDetailBody } from './VolumeEntityDetailBody';
import { VolumeEntityDetailFooter } from './VolumeEntityDetailFooter';
import { VolumeEntityDetailHeader } from './VolumeEntityDetailHeader';

import type { Volume } from '@linode/api-v4';

interface Props {
  volume: Volume;
}

export const VolumeEntityDetail = ({ volume }: Props) => {
  return (
    <EntityDetail
      body={<VolumeEntityDetailBody volume={volume} />}
      footer={<VolumeEntityDetailFooter volume={volume} />}
      header={<VolumeEntityDetailHeader volume={volume} />}
    />
  );
};
