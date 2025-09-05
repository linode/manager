import { useVolumeUpdateMutation } from '@linode/queries';
import { useEditableLabelState } from '@linode/utilities';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import type { Volume } from '@linode/api-v4';

interface Props {
  volume: Volume;
}

export const VolumeDetailsHeader = ({ volume }: Props) => {
  const { mutateAsync: updateVolume } = useVolumeUpdateMutation(volume.id);
  const { editableLabelError, resetEditableLabel, setEditableLabelError } =
    useEditableLabelState();

  const updateLabel = (label: string) => {
    return updateVolume({ label }).catch((e) =>
      setEditableLabelError(
        getAPIErrorOrDefault(e, 'Error updating tags')[0].reason
      )
    );
  };

  return (
    <LandingHeader
      breadcrumbProps={{
        onEditHandlers: {
          editableTextTitle: volume.label,
          errorText: editableLabelError,
          onCancel: resetEditableLabel,
          onEdit: updateLabel,
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
