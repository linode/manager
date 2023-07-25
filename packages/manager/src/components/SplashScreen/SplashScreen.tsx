import { styled } from '@mui/material/styles';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';

import { CircleProgress } from 'src/components/CircleProgress';
import useFeatureFlagsLoad from 'src/hooks/useFeatureFlagLoad';
import { MapState } from 'src/store/types';
import { srSpeak } from 'src/utilities/accessibility';

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

const StyledDiv = styled('div')(({ theme }) => ({
  alignItems: 'center',
  backgroundColor: theme.bg.main,
  display: 'flex',
  height: '100vh',
  justifyContent: 'center',
  left: 0,
  position: 'fixed',
  top: 0,
  width: '100vw',
  zIndex: 100,
}));
