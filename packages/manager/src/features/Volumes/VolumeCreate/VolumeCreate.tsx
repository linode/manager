import * as React from 'react';
import { MapDispatchToProps, connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { useRegionsQuery } from 'src/queries/regions';
import { MapState } from 'src/store/types';
import { openForConfig, viewResizeInstructions } from 'src/store/volumeForm';

import CreateVolumeForm from './CreateVolumeForm';

interface StateProps {
  linodeId?: number;
  linodeLabel?: string;
  linodeRegion?: string;
  message?: string;
  mode: string;
  volumeId?: number;
  volumeLabel?: string;
  volumePath?: string;
  volumeRegion?: string;
  volumeSize?: number;
  volumeTags?: string[];
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
      dispatch(viewResizeInstructions({ message, volumeLabel })),
  },
});

type CombinedProps = StateProps & RouteComponentProps<{}> & DispatchProps;

const VolumeCreate: React.FC<CombinedProps> = (props) => {
  const regions = useRegionsQuery().data ?? [];

  const { actions, history } = props;

  return (
    <>
      <DocumentTitleSegment segment="Create Volume" />
      <ProductInformationBanner bannerLocation="Volumes" />
      <LandingHeader title="Create" />
      <CreateVolumeForm
        history={history}
        onSuccess={actions.openForConfig}
        regions={regions}
      />
    </>
  );
};

const mapStateToProps: MapState<StateProps, {}> = (state) => {
  const {
    linodeId,
    linodeLabel,
    linodeRegion,
    message,
    mode,
    volumeId,
    volumeLabel,
    volumePath,
    volumeRegion,
    volumeSize,
    volumeTags,
  } = state.volumeDrawer;

  return {
    linode_id: linodeId,
    linodeLabel,
    linodeRegion,
    message,
    mode,
    volumeId,
    volumeLabel,
    volumePath,
    volumeRegion,
    volumeSize,
    volumeTags,
  };
};

const connected = connect(mapStateToProps, mapDispatchToProps);

export default connected(VolumeCreate);
