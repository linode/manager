import { InjectedNotistackProps, withSnackbar } from 'notistack';
import { pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Notice from 'src/components/Notice';
import { startMutation } from 'src/services/linodes';
import {
  withTypes,
  WithTypes
} from 'src/store/linodeType/linodeType.containers';
import { IncrediblyExtendedLinode, withLinode } from '../context';
import MutateDrawer from '../MutateDrawer';
import withMutationDrawerState, {
  MutationDrawerProps
} from './mutationDrawerState';

type ClassNames = 'pendingMutationLink';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  pendingMutationLink: {
    color: theme.palette.primary.main,
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline'
    }
  }
});

type CombinedProps = MutationDrawerProps & {
  linode: IncrediblyExtendedLinode;
} & WithTypes &
  InjectedNotistackProps &
  WithStyles<ClassNames>;

const MutationNotification: React.StatelessComponent<CombinedProps> = props => {
  const {
    classes,
    types,
    linode,
    enqueueSnackbar,
    openMutationDrawer,
    closeMutationDrawer,
    mutationFailed,
    mutationDrawerError,
    mutationDrawerLoading,
    mutationDrawerOpen
  } = props;

  const { _type } = linode;

  /** Mutate */
  if (!_type) {
    throw Error(`Unable to locate type information.`);
  }

  const successorId = _type.successor;

  const successorType = successorId
    ? types.find(({ id }) => id === successorId)
    : null;
  const { vcpus, network_out, disk, transfer, memory } = _type;

  const initMutation = () => {
    if (!linode) {
      return;
    }

    openMutationDrawer();

    /*
     * It's okay to disregard the possiblity of linode
     * being undefined. The upgrade message won't appear unless
     * it's defined
     */
    startMutation(linode.id)
      .then(() => {
        closeMutationDrawer();
        enqueueSnackbar('Linode upgrade has been initiated.', {
          variant: 'info'
        });
      })
      .catch(errors => {
        const e = pathOr(
          'Mutation could not be initiated.',
          ['response', 'data', 'errors', 0, 'reason'],
          errors
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
        {`This Linode has pending upgrades available. To learn more about
this upgrade and what it includes, `}
        <span
          className={classes.pendingMutationLink}
          onClick={openMutationDrawer}
        >
          click here.
        </span>
      </Notice>
      <MutateDrawer
        linodeId={linode.id}
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
          vcpus: linode.specs.vcpus,
          transfer: linode.specs.transfer,
          disk: linode.specs.disk,
          memory: linode.specs.memory,
          network_out
        }}
        initMutation={initMutation}
      />
      )
    </>
  );
};

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, {}>(
  styled,
  withTypes(),
  withLinode(({ linode }) => ({ linode })),
  withMutationDrawerState,
  withSnackbar
);

export default enhanced(MutationNotification);
