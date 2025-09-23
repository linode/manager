import { useVolumeUpdateMutation } from '@linode/queries';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';

import type { Volume } from '@linode/api-v4';

interface Props {
  volume: Volume;
}

export const VolumeDetailsHeader = ({ volume }: Props) => {
  const {
    mutateAsync: updateVolume,
    error,
    reset,
  } = useVolumeUpdateMutation(volume.id);

  return (
    <LandingHeader
      breadcrumbProps={{
        onEditHandlers: {
          editableTextTitle: volume.label,
          errorText: error?.[0].reason,
          onCancel: reset,
          onEdit: (label) => updateVolume({ label }),
        },
        pathname: `/volumes/${volume.label}`,
      }}
      docsLabel="Getting Started"
      docsLink="https://techdocs.akamai.com/cloud-computing/docs/faqs-for-compute-instances"
      entity="Volume"
      spacingBottom={16}
    />
  );
};
