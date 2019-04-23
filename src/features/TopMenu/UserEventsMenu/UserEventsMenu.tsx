import Modal from '@material-ui/core/Modal';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import Button from 'src/components/Button';
import MenuList from 'src/components/core/MenuList';
import Paper from 'src/components/core/Paper';
import Popper from 'src/components/core/Popper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import { markAllSeen } from 'src/store/events/event.request';
import { MapState, ThunkDispatch } from 'src/store/types';
import UserEventsButton from './UserEventsButton';
import UserEventsList from './UserEventsList';

type ClassNames = 'root' | 'dropDown' | 'hidden' | 'viewAll';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    boxShadow: `0 0 5px ${theme.color.boxShadow}`,
    outline: 0,
    position: 'absolute',
    right: theme.spacing.unit * 2,
    top: 40 + theme.spacing.unit * 4
  },
  dropDown: {
    outline: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    minHeight: 16,
    maxWidth: 250,
    maxHeight: 360,
    [theme.breakpoints.up('sm')]: {
      maxWidth: 450
    }
  },
  hidden: {
    height: 0,
    padding: 0
  },
  viewAll: {
    backgroundColor: theme.bg.offWhiteDT,
    width: '100%',
    textAlign: 'left',
    color: theme.color.headline,
    '& > span': {
      justifyContent: 'flex-start'
    }
  }
});

interface State {
  anchorEl?: HTMLElement;
}

type CombinedProps = StateProps &
  DispatchProps &
  RouteComponentProps<void> &
  WithStyles<ClassNames>;

export class UserEventsMenu extends React.Component<CombinedProps, State> {
  state = {
    anchorEl: undefined
  };

  static defaultProps = {
    unseenCount: 0,
    events: []
  };

  render() {
    const { anchorEl } = this.state;
    const {
      classes,
      events,
      unseenCount,
      history: { push }
    } = this.props;

    return (
      <React.Fragment>
        <UserEventsButton
          onClick={this.openMenu}
          count={unseenCount}
          disabled={events.length === 0}
          className={anchorEl ? 'active' : ''}
        />
        <Popper open={Boolean(anchorEl)} anchorEl={anchorEl} disablePortal>
          {({ TransitionProps, placement }) => (
            <Modal
              aria-labelledby="simple-modal-title"
              aria-describedby="simple-modal-description"
              open={Boolean(anchorEl)}
              onClose={this.closeMenu}
              BackdropProps={{ invisible: true }}
            >
              <Paper
                className={classes.root}
                {...TransitionProps}
                style={{
                  transformOrigin:
                    placement === 'bottom' ? 'center top' : 'center bottom'
                }}
              >
                <MenuList className={classes.dropDown}>
                  <UserEventsList events={events} closeMenu={this.closeMenu} />
                </MenuList>
                <Button
                  data-qa-view-all-events
                  className={classes.viewAll}
                  onClick={(e: any) => {
                    push('/events');
                    this.closeMenu(e);
                  }}
                >
                  View All Events
                </Button>
              </Paper>
            </Modal>
          )}
        </Popper>
      </React.Fragment>
    );
  }

  openMenu = (e: React.MouseEvent<HTMLElement>) => {
    this.setState({ anchorEl: e.currentTarget });
  };

  closeMenu = (e: React.MouseEvent<HTMLElement>) => {
    const { actions } = this.props;
    actions.markAllSeen();
    this.setState({ anchorEl: undefined });
  };
}

const styled = withStyles(styles);

interface DispatchProps {
  actions: {
    markAllSeen: () => Promise<any>;
  };
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: ThunkDispatch
) => ({
  actions: {
    markAllSeen: () => dispatch(markAllSeen())
  }
});

interface StateProps {
  events: Linode.Event[];
  unseenCount: number;
}
const mapStateToProps: MapState<StateProps, {}> = state => {
  return {
    events: state.events.events,
    unseenCount: state.events.countUnseenEvents
  };
};

const connected = connect(
  mapStateToProps,
  mapDispatchToProps
);

export default styled(withRouter(connected(UserEventsMenu)));
