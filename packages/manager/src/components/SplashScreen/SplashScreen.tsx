import * as classNames from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { makeStyles } from 'src/components/core/styles';
import { MapState } from 'src/store/types';

import Logo from 'src/assets/logo/logo-footer.svg';
import './keyframes.css';

const tileSize = 100;

const useStyles = makeStyles({
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
  layer: {
    position: 'absolute',
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.4)',
    transform: 'rotateX(50deg) rotateY(0deg) rotateZ(45deg)'
  },
  logo: {
    position: 'relative',
    width: 80,
    top: -120
  },
  layer1: {
    width: tileSize,
    height: tileSize,
    background: '#00B258',
    marginTop: '2rem',
    animation:
      'movedownLarge 1.7s cubic-bezier(0.39, 0.575, 0.565, 1) 0.85s infinite normal'
  },
  layer2: {
    width: tileSize,
    height: tileSize,
    background: '#32363C',
    marginTop: '1rem'
  },
  layer3: {
    width: tileSize,
    height: tileSize,
    background: '#3683DC',
    animation:
      'moveupLarge 1.7s cubic-bezier(0.39, 0.575, 0.565, 1) infinite normal'
  }
});

type CombinedProps = StateProps;

const SplashScreen: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  return !props.appIsLoading ? (
    <>
      <div
        className={classNames({
          [classes.root]: true
        })}
      >
        <div className={classes.logo}>
          <Logo />
        </div>
        <div
          className={classNames({
            [classes.layer]: true,
            [classes.layer1]: true
          })}
        />
        <div
          className={classNames({
            [classes.layer]: true,
            [classes.layer2]: true
          })}
        />
        <div
          className={classNames({
            [classes.layer]: true,
            [classes.layer3]: true
          })}
        />
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
