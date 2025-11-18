import { useVolumeQuery } from '@linode/queries';
import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { EntityDetail } from 'src/components/EntityDetail/EntityDetail';

import { useVolumeActionHandlers } from '../../hooks/useVolumeActionHandlers';
import { VolumeEntityDetailBody } from './VolumeEntityDetailBody';
import { VolumeEntityDetailFooter } from './VolumeEntityDetailFooter';
import { VolumeEntityDetailHeader } from './VolumeEntityDetailHeader';

export const VolumeSummary = () => {
  const { volumeId } = useParams({ from: '/volumes/$volumeId' });
  const { data: volume } = useVolumeQuery(volumeId);
  const { getActionHandlers } = useVolumeActionHandlers(
    '/volumes/$volumeId/summary'
  );

  if (!volume) return null;

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
