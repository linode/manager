import * as classNames from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { makeStyles } from 'src/components/core/styles';
import { MapState } from 'src/store/types';
import './keyframes.css';

const useStyles = makeStyles({
  root: {
    backgroundColor: '#f4f4f4',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    position: 'absolute',
    zIndex: 100,
    '& > div': {
      width: `7rem`,
      height: `7rem`
    }
  },
  layer: {
    position: 'absolute',
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.4)',
    transform: 'rotateX(50deg) rotateY(0deg) rotateZ(45deg)'
  },
  layer1: {
    background: '#32363C',
    marginTop: '2rem',
    animation:
      'movedownLarge 1.7s cubic-bezier(0.39, 0.575, 0.565, 1) 0.85s infinite normal'
  },
  layer2: {
    background: '#3683DC',
    marginTop: '1rem'
  },
  layer3: {
    background: '#E1EDFA',
    animation:
      'moveupLarge 1.7s cubic-bezier(0.39, 0.575, 0.565, 1) infinite normal'
  }
});

type CombinedProps = StateProps;

const SplashScreen: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  return props.appIsLoading ? (
    <div
      className={classNames({
        [classes.root]: true
      })}
    >
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
