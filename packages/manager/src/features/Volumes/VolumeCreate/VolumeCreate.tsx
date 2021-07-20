import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import BreadCrumb from 'src/components/Breadcrumb';
import { makeStyles, Theme } from 'src/components/core/styles';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import { useRegionsQuery } from 'src/queries/regions';
import { MapState } from 'src/store/types';
import { openForConfig, viewResizeInstructions } from 'src/store/volumeForm';
import CreateVolumeForm from './CreateVolumeForm';

const useStyles = makeStyles((theme: Theme) => ({
  main: {
    marginTop: theme.spacing(1),
  },
  title: {
    marginBottom: theme.spacing(1),
  },
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

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch
) => ({
  actions: {
    openForConfig: (
      volumeLabel: string,
      volumePath: string,
      message?: string
    ) => dispatch(openForConfig(volumeLabel, volumePath, message)),
    openForResizeInstructions: (volumeLabel: string, message?: string) =>
      dispatch(viewResizeInstructions({ volumeLabel, message })),
  },
});

type CombinedProps = StateProps & RouteComponentProps<{}> & DispatchProps;

const VolumeCreate: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const regions = useRegionsQuery().data ?? [];
  const { actions, history } = props;

  return (
    <>
      <DocumentTitleSegment segment="Create Volume" />
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

const mapStateToProps: MapState<StateProps, {}> = (state) => {
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
    message,
  } = state.volumeDrawer;

  return {
    linode_id: linodeId,
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
  };
};

const connected = connect(mapStateToProps, mapDispatchToProps);

export default connected(VolumeCreate);
