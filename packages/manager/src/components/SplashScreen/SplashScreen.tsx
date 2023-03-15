import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { makeStyles } from '@mui/styles';
import { MapState } from 'src/store/types';
import { srSpeak } from 'src/utilities/accessibility';
import useFeatureFlagsLoad from 'src/hooks/useFeatureFlagLoad';
import CircleProgress from '../CircleProgress';

const useStyles = makeStyles({
  root: {
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
  },
});

type CombinedProps = StateProps;

const SplashScreen = (props: CombinedProps) => {
  const classes = useStyles();

  React.useEffect(() => {
    srSpeak('Loading Linode Cloud Manager', 'polite');
  }, []);

  const { featureFlagsLoading } = useFeatureFlagsLoad();

  return props.appIsLoading || featureFlagsLoading ? (
    <div className={classes.root} aria-label="Loading Cloud Manager">
      <CircleProgress />
    </div>
  ) : null;
};

interface StateProps {
  appIsLoading: boolean;
}

const mapStateToProps: MapState<StateProps, {}> = (state) => ({
  appIsLoading: state.initialLoad.appIsLoading,
});

const connected = connect(mapStateToProps);

export default compose<CombinedProps, {}>(connected, React.memo)(SplashScreen);
