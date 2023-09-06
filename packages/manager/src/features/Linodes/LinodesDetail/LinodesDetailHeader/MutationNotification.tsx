import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import { MBpsIntraDC } from 'src/constants';
import { resetEventsPolling } from 'src/eventsPolling';
import { useStartLinodeMutationMutation } from 'src/queries/linodes/actions';
import { useAllLinodeDisksQuery } from 'src/queries/linodes/disks';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import { useTypeQuery } from 'src/queries/types';

import { addUsedDiskSpace } from '../LinodeStorage/LinodeDisks';
import { MutateDrawer } from '../MutateDrawer/MutateDrawer';

interface Props {
  linodeId: number;
}

export const MutationNotification = (props: Props) => {
  const { linodeId } = props;
  const { enqueueSnackbar } = useSnackbar();

  const { data: linode } = useLinodeQuery(linodeId);

  const { data: currentTypeInfo } = useTypeQuery(
    linode?.type ?? '',
    Boolean(linode?.type)
  );

  const { data: successorTypeInfo } = useTypeQuery(
    currentTypeInfo?.successor ?? '',
    Boolean(currentTypeInfo?.successor)
  );

  const { data: disks } = useAllLinodeDisksQuery(
    linodeId,
    successorTypeInfo !== undefined
  );

  const [isMutationDrawerOpen, setIsMutationDrawerOpen] = React.useState(false);

  const {
    error,
    isLoading,
    mutateAsync: startMutation,
  } = useStartLinodeMutationMutation(linodeId);

  const initMutation = () => {
    startMutation().then(() => {
      setIsMutationDrawerOpen(false);
      resetEventsPolling();
      enqueueSnackbar('Linode upgrade has been initiated.', {
        variant: 'info',
      });
    });
  };

  const usedDiskSpace = addUsedDiskSpace(disks ?? []);
  const estimatedTimeToUpgradeInMins = Math.ceil(
    usedDiskSpace / MBpsIntraDC / 60
  );

  /** Mutate */
  if (!currentTypeInfo || !successorTypeInfo) {
    return null;
  }

  const { disk, memory, network_out, transfer, vcpus } = currentTypeInfo;

  return (
    <>
      <Notice important variant="warning">
        <Typography>
          You have a pending upgrade. The estimated time to complete this
          upgrade is
          {` ` +
            (estimatedTimeToUpgradeInMins < 1
              ? '< 1'
              : estimatedTimeToUpgradeInMins)}
          {estimatedTimeToUpgradeInMins < 1 ? ` minute` : ` minutes`}. To learn
          more,&nbsp;
          <StyledSpan
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setIsMutationDrawerOpen(true);
              }
            }}
            onClick={() => setIsMutationDrawerOpen(true)}
            role="button"
            tabIndex={0}
          >
            click here
          </StyledSpan>
          .
        </Typography>
      </Notice>
      <MutateDrawer
        currentTypeInfo={{
          disk: currentTypeInfo.disk,
          memory: currentTypeInfo.memory,
          network_out,
          transfer: currentTypeInfo.transfer,
          vcpus: currentTypeInfo.vcpus,
        }}
        isMovingFromSharedToDedicated={isMovingFromSharedToDedicated(
          currentTypeInfo.id,
          successorTypeInfo.id
        )}
        mutateInfo={{
          disk: successorTypeInfo.disk !== disk ? successorTypeInfo.disk : null,
          memory:
            successorTypeInfo.memory !== memory
              ? successorTypeInfo.memory
              : null,
          network_out:
            successorTypeInfo.network_out !== network_out
              ? successorTypeInfo.network_out
              : null,
          transfer:
            successorTypeInfo.transfer !== transfer
              ? successorTypeInfo.transfer
              : null,
          vcpus:
            successorTypeInfo.vcpus !== vcpus ? successorTypeInfo.vcpus : null,
        }}
        error={error?.[0].reason}
        estimatedTimeToUpgradeInMins={estimatedTimeToUpgradeInMins}
        handleClose={() => setIsMutationDrawerOpen(false)}
        initMutation={initMutation}
        linodeId={linodeId}
        loading={isLoading}
        open={isMutationDrawerOpen}
      />
    </>
  );
};

const StyledSpan = styled('span', { label: 'StyledSpan' })(({ theme }) => ({
  ...theme.applyLinkStyles,
}));

// Hack solution to determine if a type is moving from shared CPU cores to dedicated.
const isMovingFromSharedToDedicated = (typeA: string, typeB: string) => {
  return typeA.startsWith('g6-highmem') && typeB.startsWith('g7-highmem');
};
