import { useVolumeUpdateMutation } from '@linode/queries';
import { useSnackbar } from 'notistack';
import React from 'react';

import { TagCell } from 'src/components/TagCell/TagCell';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import type { Volume } from '@linode/api-v4';

interface Props {
  volume: Volume;
}

export const VolumeEntityDetailFooter = ({ volume }: Props) => {
  const { enqueueSnackbar } = useSnackbar();
  const { mutateAsync: updateVolume } = useVolumeUpdateMutation(volume.id);
  const { data: volumePermissions } = usePermissions(
    'volume',
    ['update_volume'],
    volume.id
  );

  const updateTags = React.useCallback(
    async (tags: string[]) => {
      return updateVolume({ tags }).catch((e) =>
        enqueueSnackbar(
          getAPIErrorOrDefault(e, 'Error updating tags')[0].reason,
          {
            variant: 'error',
          }
        )
      );
    },
    [updateVolume, enqueueSnackbar]
  );

  return (
    <TagCell
      disabled={!volumePermissions.update_volume}
      entity="Volume"
      sx={{
        width: '100%',
      }}
      tags={volume.tags}
      updateTags={updateTags}
      view="inline"
    />
  );
};
