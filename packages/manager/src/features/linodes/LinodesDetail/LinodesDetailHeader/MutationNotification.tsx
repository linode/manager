import { Disk } from '@linode/api-v4/lib/linodes';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import { Notice } from 'src/components/Notice/Notice';
import { MBpsIntraDC } from 'src/constants';
import { resetEventsPolling } from 'src/eventsPolling';
import { useTypeQuery } from 'src/queries/types';
import MutateDrawer from '../MutateDrawer';
import { makeStyles } from 'tss-react/mui';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import { useAllLinodeDisksQuery } from 'src/queries/linodes/disks';
import { useStartLinodeMutationMutation } from 'src/queries/linodes/actions';

const useStyles = makeStyles()((theme: Theme) => ({
  pendingMutationLink: {
    ...theme.applyLinkStyles,
  },
}));

interface Props {
  linodeId: number;
}

export const MutationNotification = (props: Props) => {
  const { classes } = useStyles();
  const { linodeId } = props;
  const { enqueueSnackbar } = useSnackbar();

  const { data: linode } = useLinodeQuery(linodeId);

  const { data: disks } = useAllLinodeDisksQuery(linodeId);

  const { data: currentTypeInfo } = useTypeQuery(
    linode?.type ?? '',
    linode !== undefined
  );

  const [isMutationDrawerOpen, setIsMutationDrawerOpen] = React.useState(false);

  const {
    mutateAsync: startMutation,
    isLoading,
    error,
  } = useStartLinodeMutationMutation(linodeId);

  const { data: sucessorTypeInfo } = useTypeQuery(
    currentTypeInfo?.successor ?? '',
    currentTypeInfo !== undefined && currentTypeInfo.successor !== null
  );

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
  if (!currentTypeInfo || !sucessorTypeInfo) {
    return null;
  }

  const { vcpus, network_out, disk, transfer, memory } = currentTypeInfo;

  return (
    <>
      <Notice important warning>
        <Typography>
          You have a pending upgrade. The estimated time to complete this
          upgrade is
          {` ` +
            (estimatedTimeToUpgradeInMins < 1
              ? '< 1'
              : estimatedTimeToUpgradeInMins)}
          {estimatedTimeToUpgradeInMins < 1 ? ` minute` : ` minutes`}. To learn
          more,&nbsp;
          <span
            className={classes.pendingMutationLink}
            onClick={() => setIsMutationDrawerOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setIsMutationDrawerOpen(true);
              }
            }}
            role="button"
            tabIndex={0}
          >
            click here
          </span>
          .
        </Typography>
      </Notice>
      <MutateDrawer
        estimatedTimeToUpgradeInMins={estimatedTimeToUpgradeInMins}
        linodeId={linodeId}
        open={isMutationDrawerOpen}
        loading={isLoading}
        error={error?.[0].reason}
        handleClose={() => setIsMutationDrawerOpen(false)}
        isMovingFromSharedToDedicated={isMovingFromSharedToDedicated(
          currentTypeInfo.id,
          sucessorTypeInfo.id
        )}
        mutateInfo={{
          vcpus:
            sucessorTypeInfo.vcpus !== vcpus ? sucessorTypeInfo.vcpus : null,
          network_out:
            sucessorTypeInfo.network_out !== network_out
              ? sucessorTypeInfo.network_out
              : null,
          disk: sucessorTypeInfo.disk !== disk ? sucessorTypeInfo.disk : null,
          transfer:
            sucessorTypeInfo.transfer !== transfer
              ? sucessorTypeInfo.transfer
              : null,
          memory:
            sucessorTypeInfo.memory !== memory ? sucessorTypeInfo.memory : null,
        }}
        currentTypeInfo={{
          vcpus: currentTypeInfo.vcpus,
          transfer: currentTypeInfo.transfer,
          disk: currentTypeInfo.disk,
          memory: currentTypeInfo.memory,
          network_out,
        }}
        initMutation={initMutation}
      />
    </>
  );
};

/**
 * add all the used disk space together
 */
export const addUsedDiskSpace = (disks: Disk[]) => {
  return disks.reduce((accum, eachDisk) => eachDisk.size + accum, 0);
};

// Hack solution to determine if a type is moving from shared CPU cores to dedicated.
const isMovingFromSharedToDedicated = (typeA: string, typeB: string) => {
  return typeA.startsWith('g6-highmem') && typeB.startsWith('g7-highmem');
};
