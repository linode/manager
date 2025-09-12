import * as React from 'react';

import { EntityDetail } from 'src/components/EntityDetail/EntityDetail';

import { useVolumeActionHandlers } from '../../hooks/useVolumeActionHandlers';
import { VolumeEntityDetailBody } from './VolumeEntityDetailBody';
import { VolumeEntityDetailFooter } from './VolumeEntityDetailFooter';
import { VolumeEntityDetailHeader } from './VolumeEntityDetailHeader';

import type { Volume } from '@linode/api-v4';

interface Props {
  volume: Volume;
}
export const VolumeEntityDetail = ({ volume }: Props) => {
  const { getActionHandlers } = useVolumeActionHandlers(
    '/volumes/$volumeId/summary'
  );

  const handlers = getActionHandlers(volume.id);

  return (
    <EntityDetail
      body={
        <VolumeEntityDetailBody
          detachHandler={handlers.handleDetach}
          volume={volume}
        />
      }
      footer={<VolumeEntityDetailFooter volume={volume} />}
      header={<VolumeEntityDetailHeader handlers={handlers} volume={volume} />}
    />
  );
};
