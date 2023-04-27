import * as React from 'react';
import useExtendedLinode from 'src/hooks/useExtendedLinode';
import BareMetalRescue from './BareMetalRescue';
import RescueDialog from './RescueDialog';

export interface Props {
  open: boolean;
  onClose: () => void;
  linodeId: number | undefined;
}

export const RescueContainer = (props: Props) => {
  const { linodeId, open, onClose } = props;
  const linode = useExtendedLinode(linodeId ?? -1);
  const isBareMetalInstance = linode?._type?.class === 'metal';
  const linodeLabel = linode?.label ?? '';

  /**
   * Bare Metal Linodes have a much simpler Rescue flow,
   * since it's not possible to select disk mounts. Rather
   * than conditionally handle everything in RescueDialog,
   * we instead render a simple ConfirmationDialog for
   * these instances.
   */
  return isBareMetalInstance ? (
    <BareMetalRescue
      linodeID={linodeId ?? -1}
      linodeLabel={linodeLabel}
      isOpen={open}
      onClose={onClose}
    />
  ) : (
    /** For normal Linodes, load the standard rescue dialog. */
    <RescueDialog linodeId={linodeId ?? -1} open={open} onClose={onClose} />
  );
};

export default RescueContainer;
