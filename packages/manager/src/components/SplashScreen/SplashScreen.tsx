import * as classNames from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { makeStyles } from 'src/components/core/styles';
import { MapState } from 'src/store/types';
import { srSpeak } from 'src/utilities/accessibility';

import Logo from 'src/assets/logo/logo-animated.svg';
import './keyframes.css';

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
    left: 0
  },
  layer: {
    position: 'absolute',
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.4)',
    transform: 'rotateX(50deg) rotateY(0deg) rotateZ(45deg)'
  },
  logo: {
    position: 'relative'
  }
});

type CombinedProps = StateProps;

const SplashScreen: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  React.useEffect(() => {
    srSpeak('Loading Linode Cloud Manager', 'polite');
  }, []);

  return props.appIsLoading ? (
    <>
      <div
        className={classNames({
          [classes.root]: true
        })}
        aria-label="Loading Cloud Manager"
      >
        <div className={classes.logo}>
          <Logo />
          <div className="la-ball-beat la-dark">
            <div />
            <div />
            <div />
          </div>
        </div>
      </div>
    </>
  ) : null;
};

interface StateProps {
  appIsLoading: boolean;
}

const mapStateToProps: MapState<StateProps, {}> = state => ({
  appIsLoading: state.initialLoad.appIsLoading
});

const connected = connect(mapStateToProps);

export default compose<CombinedProps, {}>(
  connected,
  React.memo
)(SplashScreen);
