import { Disk, getType, LinodeSpecs, LinodeType, startMutation } from 'linode-js-sdk/lib/linodes'
import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose } from 'recompose';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Notice from 'src/components/Notice';
import { resetEventsPolling } from 'src/events';
import { ApplicationState } from 'src/store';
import { requestLinodeForStore } from 'src/store/linodes/linode.requests';
import {
  withTypes,
  WithTypes
} from 'src/store/linodeType/linodeType.containers';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import { withLinodeDetailContext } from '../linodeDetailContext';
import MutateDrawer from '../MutateDrawer';
import withMutationDrawerState, {
  MutationDrawerProps
} from './mutationDrawerState';

import { MBpsIntraDC } from 'src/constants';

type ClassNames = 'pendingMutationLink';

const styles = (theme: Theme) =>
  createStyles({
    pendingMutationLink: {
      color: theme.palette.primary.main,
      cursor: 'pointer',
      '&:hover': {
        textDecoration: 'underline'
      }
    }
  });

interface Props {
  disks: Disk[];
}

type CombinedProps = Props &
  MutationDrawerProps &
  ContextProps &
  WithTypes &
  WithSnackbarProps &
  DispatchProps &
  WithStyles<ClassNames>;

const MutationNotification: React.FC<CombinedProps> = props => {
  const {
    classes,
    types: allTypes,
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
    updateLinode
  } = props;

  const [
    successorMetaData,
    setSuccessorMetaData
  ] = React.useState<LinodeType | null>(null);

  React.useEffect(() => {
    if (!linodeType) {
      return;
    }

    /** did we find successor meta data in GET /types or GET /types-legacy? */
    const foundSuccessorInAllTypes = allTypes.find(
      ({ id }) => id === linodeType.successor
    );

    if (allTypes.length > 0 && !!foundSuccessorInAllTypes) {
      setSuccessorMetaData(foundSuccessorInAllTypes);
    } else {
      /**
       * this means we couldn't find the Linode's successor in either
       * GET request to /types or /types-legacy. This is a SUPER edge
       * case but it *does* happen. An example type that would flatter this
       * condition would be the "standard-4" plan. In this case, we need to actually
       * request the successor metadata
       */
      if (linodeType.successor) {
        getType(linodeType.successor)
          .then(requestedType => {
            setSuccessorMetaData(requestedType);
          })
          /** just silently fail if we couldn't get the data */
          .catch(e => e);
      }
    }
  }, [allTypes, linodeType]);

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
          variant: 'info'
        });
      })
      .catch(errors => {
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
        You have a pending upgrade. The estimated time to complete this upgrade
        is
        {` ` +
          (estimatedTimeToUpgradeInMins < 1
            ? '< 1'
            : estimatedTimeToUpgradeInMins)}
        {estimatedTimeToUpgradeInMins < 1 ? ` minute` : ` minutes`}. To learn
        more,&nbsp;
        <span
          className={classes.pendingMutationLink}
          onClick={openMutationDrawer}
        >
          click here.
        </span>
      </Notice>
      <MutateDrawer
        estimatedTimeToUpgradeInMins={estimatedTimeToUpgradeInMins}
        linodeId={linodeId}
        open={mutationDrawerOpen}
        loading={mutationDrawerLoading}
        error={mutationDrawerError}
        handleClose={closeMutationDrawer}
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
              : null
        }}
        currentTypeInfo={{
          vcpus: linodeSpecs.vcpus,
          transfer: linodeSpecs.transfer,
          disk: linodeSpecs.disk,
          memory: linodeSpecs.memory,
          network_out
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
  linodeType?: LinodeType | null;
}

interface DispatchProps {
  updateLinode: (id: number) => void;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, Action<any>>
) => {
  return {
    updateLinode: (id: number) => dispatch(requestLinodeForStore(id))
  };
};

const connected = connect(
  undefined,
  mapDispatchToProps
);

const enhanced = compose<CombinedProps, Props>(
  styled,
  connected,
  withTypes(),
  withLinodeDetailContext<ContextProps>(({ linode }) => ({
    linodeSpecs: linode.specs,
    linodeId: linode.id,
    linodeType: linode._type
  })),
  withMutationDrawerState,
  withSnackbar
);

export default enhanced(MutationNotification);
