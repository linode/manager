import * as React from 'react';

import { useLinodeQuery } from 'src/queries/linodes/linodes';
import { useTypeQuery } from 'src/queries/types';

import { BareMetalRescue } from './BareMetalRescue';
import { StandardRescueDialog } from './StandardRescueDialog';

export interface Props {
  linodeId: number | undefined;
  linodeLabel: string | undefined;
  onClose: () => void;
  open: boolean;
}

export const RescueDialog = (props: Props) => {
  const { linodeId, linodeLabel, onClose, open } = props;

  const { data: linode } = useLinodeQuery(
    linodeId ?? -1,
    linodeId !== undefined && open
  );
  const { data: type } = useTypeQuery(
    linode?.type ?? '',
    Boolean(linode?.type)
  );

  const isBareMetalInstance = type?.class === 'metal';

  /**
   * Bare Metal Linodes have a much simpler Rescue flow,
   * since it's not possible to select disk mounts. Rather
   * than conditionally handle everything in RescueDialog,
   * we instead render a simple ConfirmationDialog for
   * these instances.
   */
  return isBareMetalInstance ? (
    <BareMetalRescue
      isOpen={open}
      linodeId={linodeId}
      linodeLabel={linodeLabel}
      onClose={onClose}
    />
  ) : (
    /** For normal Linodes, load the standard rescue dialog. */
    <StandardRescueDialog
      linodeId={linodeId}
      linodeLabel={linodeLabel}
      onClose={onClose}
      open={open}
    />
  );
};
