import { styled } from '@mui/material/styles';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import useFeatureFlagsLoad from 'src/hooks/useFeatureFlagLoad';
import { MapState } from 'src/store/types';
import { srSpeak } from 'src/utilities/accessibility';
import CircleProgress from '../CircleProgress';

const SplashScreen = (props: StateProps) => {
  React.useEffect(() => {
    srSpeak('Loading Linode Cloud Manager', 'polite');
  }, []);

  const { featureFlagsLoading } = useFeatureFlagsLoad();

  return props.appIsLoading || featureFlagsLoading ? (
    <StyledDiv aria-label="Loading Cloud Manager">
      <CircleProgress />
    </StyledDiv>
  ) : null;
};

interface StateProps {
  appIsLoading: boolean;
}

const mapStateToProps: MapState<StateProps, {}> = (state) => ({
  appIsLoading: state.initialLoad.appIsLoading,
});

const connected = connect(mapStateToProps);

export default compose<StateProps, {}>(connected, React.memo)(SplashScreen);

const StyledDiv = styled('div')({
  backgroundColor: '#f4f4f4',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  width: '100vw',
  position: 'fixed',
  zIndex: 100,
  top: 0,
  left: 0,
});
