import { Grant } from 'linode-js-sdk/lib/account';
import { Region } from 'linode-js-sdk/lib/regions';
import { pathOr } from 'ramda';
import React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import BreadCrumb from 'src/components/Breadcrumb';
import { makeStyles, Theme } from 'src/components/core/styles';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import { isRestrictedUser } from 'src/features/Profile/permissionsHelpers';
import { MapState } from 'src/store/types';
import { openForConfig, viewResizeInstructions } from 'src/store/volumeForm';
import CreateVolumeForm from './CreateVolumeForm';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  main: {
    marginTop: theme.spacing(1)
  },
  title: {
    marginTop: 3,
    marginBottom: theme.spacing(1)
  }
}));

interface StateProps {
  mode: string;
  volumeId?: number;
  volumeLabel?: string;
  volumeRegion?: string;
  volumeSize?: number;
  volumeTags?: string[];
  volumePath?: string;
  linodeId?: number;
  linodeLabel?: string;
  linodeRegion?: string;
  message?: string;
  readOnly?: boolean;
  regions: Region[];
}

interface DispatchProps {
  actions: {
    openForConfig: (
      volumeLabel: string,
      volumePath: string,
      message?: string
    ) => void;
    openForResizeInstructions: (volumeLabel: string, message?: string) => void;
  };
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = dispatch => ({
  actions: {
    openForConfig: (
      volumeLabel: string,
      volumePath: string,
      message?: string
    ) => dispatch(openForConfig(volumeLabel, volumePath, message)),
    openForResizeInstructions: (volumeLabel: string, message?: string) =>
      dispatch(viewResizeInstructions({ volumeLabel, message }))
  }
});

type CombinedProps = StateProps & RouteComponentProps<{}> & DispatchProps;

const VolumeCreate: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const { actions, regions, history } = props;

  return (
    <>
      <DocumentTitleSegment segment="Create a Volume" />
      <Grid item>
        <BreadCrumb
          pathname={props.location.pathname}
          labelTitle="Create"
          className={classes.title}
        />
        <div className={classes.main}>
          <CreateVolumeForm
            onSuccess={actions.openForConfig}
            regions={regions}
            history={history}
          />
        </div>
      </Grid>
    </>
  );
};

const mapStateToProps: MapState<StateProps, {}> = state => {
  const {
    linodeId,
    linodeLabel,
    linodeRegion,
    mode,
    volumeId,
    volumeLabel,
    volumeRegion,
    volumeSize,
    volumeTags,
    volumePath,
    message
  } = state.volumeDrawer;

  const volumesPermissions = pathOr(
    [],
    ['__resources', 'profile', 'data', 'grants', 'volume'],
    state
  );
  const volumePermissions = volumesPermissions.find(
    (v: Grant) => v.id === volumeId
  );

  return {
    regions: state.__resources.regions.entities,
    linodeId,
    linodeLabel,
    linodeRegion,
    mode,
    volumeId,
    volumeLabel,
    volumeRegion,
    volumeSize,
    volumeTags,
    volumePath,
    message,
    readOnly:
      isRestrictedUser(state) &&
      volumePermissions &&
      volumePermissions.permissions === 'read_only'
  };
};

const connected = connect(
  mapStateToProps,
  mapDispatchToProps
);

export default connected(VolumeCreate);
