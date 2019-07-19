import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { makeStyles } from 'src/components/core/styles';
import { MapState } from 'src/store/types';

import Logo from 'src/assets/logo/logo-footer.svg';
import Loading from 'src/components/LandingLoading';

const useStyles = makeStyles({
  '@keyframes bounce': {
    from: {
      transform: 'translateY(0px)'
    },
    to: {
      transform: 'translateY(-20px)'
    }
  },
  root: {
    backgroundColor: '#f4f4f4',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    position: 'absolute',
    zIndex: 100
  },
  logo: {
    animation: '$bounce 1000ms ease-in-out infinite alternate'
  }
});

type CombinedProps = StateProps;

const SplashScreen: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  return props.appIsLoading ? (
    <Loading shouldDelay delayInMS={750}>
      <div className={classes.root}>
        <span className={classes.logo}>
          <Logo width={200} />
        </span>
      </div>
    </Loading>
  ) : null;
};

interface StateProps {
  appIsLoading: boolean;
  loadingText: string;
}

const mapStateToProps: MapState<StateProps, {}> = state => ({
  appIsLoading: state.initialLoad.appIsLoading,
  loadingText: 'loading the app'
});

const connected = connect(mapStateToProps);

export default compose<CombinedProps, {}>(
  connected,
  React.memo
)(SplashScreen);
