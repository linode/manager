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
import { startMutation } from 'src/services/linodes';
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

type CombinedProps = MutationDrawerProps &
  ContextProps &
  WithTypes &
  WithSnackbarProps &
  DispatchProps &
  WithStyles<ClassNames>;

const MutationNotification: React.StatelessComponent<CombinedProps> = props => {
  const {
    classes,
    types,
    linodeId,
    linodeTypeData,
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

  /** Mutate */
  if (!linodeTypeData) {
    return null;
  }

  const successorId = linodeTypeData.successor;

  const successorType = successorId
    ? types.find(({ id }) => id === successorId)
    : null;
  const { vcpus, network_out, disk, transfer, memory } = linodeTypeData;

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

  if (!successorId || !successorType) {
    return null;
  }

  return (
    <>
      <Notice important warning>
        This Linode has a free upgrade available. To learn more about this
        upgrade and what it includes,&nbsp;
        <span
          className={classes.pendingMutationLink}
          onClick={openMutationDrawer}
        >
          click here.
        </span>
      </Notice>
      <MutateDrawer
        linodeId={linodeId}
        open={mutationDrawerOpen}
        loading={mutationDrawerLoading}
        error={mutationDrawerError}
        handleClose={closeMutationDrawer}
        mutateInfo={{
          vcpus: successorType.vcpus !== vcpus ? successorType.vcpus : null,
          network_out:
            successorType.network_out !== network_out
              ? successorType.network_out
              : null,
          disk: successorType.disk !== disk ? successorType.disk : null,
          transfer:
            successorType.transfer !== transfer ? successorType.transfer : null,
          memory: successorType.memory !== memory ? successorType.memory : null
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

const styled = withStyles(styles);

interface ContextProps {
  linodeSpecs: Linode.LinodeSpecs;
  linodeId: number;
  linodeType?: Linode.LinodeType | null;
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

const enhanced = compose<CombinedProps, {}>(
  styled,
  connected,
  withTypes(),
  withLinodeDetailContext<ContextProps>(({ linode }) => ({
    linodeSpecs: linode.specs,
    linodeId: linode.id,
    linodeTypeData: linode._type
  })),
  withMutationDrawerState,
  withSnackbar
);

export default enhanced(MutationNotification);
