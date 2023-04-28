import * as React from 'react';
import { BareMetalRescue } from './BareMetalRescue';
import { StandardRescueDialog } from './StandardRescueDialog';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import { useTypeQuery } from 'src/queries/types';

export interface Props {
  open: boolean;
  onClose: () => void;
  linodeId: number | undefined;
}

export const RescueDialog = (props: Props) => {
  const { linodeId, open, onClose } = props;

  const { data: linode } = useLinodeQuery(
    linodeId ?? -1,
    linodeId !== undefined
  );
  const { data: type } = useTypeQuery(linode?.type ?? '', linode !== undefined);

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
      linodeId={linodeId ?? -1}
      isOpen={open}
      onClose={onClose}
    />
  ) : (
    /** For normal Linodes, load the standard rescue dialog. */
    <StandardRescueDialog
      linodeId={linodeId ?? -1}
      open={open}
      onClose={onClose}
    />
  );
};
