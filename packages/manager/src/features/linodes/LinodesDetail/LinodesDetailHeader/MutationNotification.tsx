import { Disk, LinodeSpecs, startMutation } from '@linode/api-v4/lib/linodes';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose } from 'recompose';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { createStyles, withStyles, WithStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import { MBpsIntraDC } from 'src/constants';
import { resetEventsPolling } from 'src/eventsPolling';
import { useSpecificTypes } from 'src/queries/types';
import { ApplicationState } from 'src/store';
import { requestLinodeForStore } from 'src/store/linodes/linode.requests';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import { withLinodeDetailContext } from '../linodeDetailContext';
import MutateDrawer from '../MutateDrawer';
import withMutationDrawerState, {
  MutationDrawerProps,
} from './mutationDrawerState';
import { ExtendedType } from 'src/utilities/extendType';

type ClassNames = 'pendingMutationLink';

const styles = (theme: Theme) =>
  createStyles({
    pendingMutationLink: {
      ...theme.applyLinkStyles,
    },
  });

interface Props {
  disks: Disk[];
}

type CombinedProps = Props &
  MutationDrawerProps &
  ContextProps &
  WithSnackbarProps &
  DispatchProps &
  WithStyles<ClassNames>;

const MutationNotification: React.FC<CombinedProps> = (props) => {
  const {
    classes,
    linodeId,
    linodeType,
    linodeSpecs,
    enqueueSnackbar,
    openMutationDrawer,
    closeMutationDrawer,
    mutationFailed,
    mutationDrawerError,
    mutationDrawerLoading,
    mutationDrawerOpen,
    updateLinode,
  } = props;

  const typesQuery = useSpecificTypes(
    linodeType?.successor ? [linodeType?.successor] : []
  );
  const successorMetaData = typesQuery[0]?.data ?? null;

  const initMutation = () => {
    openMutationDrawer();

    /*
     * It's okay to disregard the possibility of linode
     * being undefined. The upgrade message won't appear unless
     * it's defined
     */
    startMutation(linodeId)
      .then(() => {
        closeMutationDrawer();
        resetEventsPolling();
        updateLinode(linodeId);
        enqueueSnackbar('Linode upgrade has been initiated.', {
          variant: 'info',
        });
      })
      .catch((errors) => {
        const e = getErrorStringOrDefault(
          errors,
          'Mutation could not be initiated.'
        );
        mutationFailed(e);
      });
  };

  const usedDiskSpace = addUsedDiskSpace(props.disks);
  const estimatedTimeToUpgradeInMins = Math.ceil(
    usedDiskSpace / MBpsIntraDC / 60
  );

  /** Mutate */
  if (!linodeType || !successorMetaData) {
    return null;
  }

  const { vcpus, network_out, disk, transfer, memory } = linodeType;

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
            onClick={openMutationDrawer}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                openMutationDrawer();
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
        open={mutationDrawerOpen}
        loading={mutationDrawerLoading}
        error={mutationDrawerError}
        handleClose={closeMutationDrawer}
        isMovingFromSharedToDedicated={isMovingFromSharedToDedicated(
          linodeType.id,
          successorMetaData.id
        )}
        mutateInfo={{
          vcpus:
            successorMetaData.vcpus !== vcpus ? successorMetaData.vcpus : null,
          network_out:
            successorMetaData.network_out !== network_out
              ? successorMetaData.network_out
              : null,
          disk: successorMetaData.disk !== disk ? successorMetaData.disk : null,
          transfer:
            successorMetaData.transfer !== transfer
              ? successorMetaData.transfer
              : null,
          memory:
            successorMetaData.memory !== memory
              ? successorMetaData.memory
              : null,
        }}
        currentTypeInfo={{
          vcpus: linodeSpecs.vcpus,
          transfer: linodeSpecs.transfer,
          disk: linodeSpecs.disk,
          memory: linodeSpecs.memory,
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

const styled = withStyles(styles);

interface ContextProps {
  linodeSpecs: LinodeSpecs;
  linodeId: number;
  linodeType?: ExtendedType | null;
}

interface DispatchProps {
  updateLinode: (id: number) => void;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, Action<any>>
) => {
  return {
    updateLinode: (id: number) => dispatch(requestLinodeForStore(id)),
  };
};

const connected = connect(undefined, mapDispatchToProps);

const enhanced = compose<CombinedProps, Props>(
  styled,
  connected,
  withLinodeDetailContext<ContextProps>(({ linode }) => ({
    linodeSpecs: linode.specs,
    linodeId: linode.id,
    linodeType: linode._type,
  })),
  withMutationDrawerState,
  withSnackbar
);

export default enhanced(MutationNotification);

// Hack solution to determine if a type is moving from shared CPU cores to dedicated.
const isMovingFromSharedToDedicated = (typeA: string, typeB: string) => {
  return typeA.startsWith('g6-highmem') && typeB.startsWith('g7-highmem');
};
