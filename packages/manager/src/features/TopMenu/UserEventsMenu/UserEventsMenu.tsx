import { Event } from '@linode/api-v4/lib/account';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Button from 'src/components/Button';
import MenuList from 'src/components/core/MenuList';
import Modal from 'src/components/core/Modal';
import Paper from 'src/components/core/Paper';
import Popper from 'src/components/core/Popper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import { getNumUnseenEvents } from 'src/store/events/event.helpers';
import { markAllSeen as _markAllSeen } from 'src/store/events/event.request';
import { MapState, ThunkDispatch } from 'src/store/types';
import { removeBlocklistedEvents } from 'src/utilities/eventUtils';
import UserEventsButton from './UserEventsButton';
import UserEventsList from './UserEventsList';

type ClassNames = 'root' | 'dropDown' | 'viewAll';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      boxShadow: `0 0 5px ${theme.color.boxShadow}`,
      outline: 0,
      position: 'absolute',
      right: theme.spacing(2),
      top: 40 + theme.spacing(4)
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
      history: { push }
    } = this.props;

    const filteredEvents = removeBlocklistedEvents(events, ['profile_update']);
    const unseenCount = getNumUnseenEvents(filteredEvents);

    return (
      <React.Fragment>
        <UserEventsButton
          onClick={this.openMenu}
          count={unseenCount}
          disabled={events.length === 0}
          className={anchorEl ? 'active' : ''}
          aria-owns={anchorEl ? 'user-events-menu' : undefined}
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
                <MenuList className={classes.dropDown} id="user-events-menu">
                  <UserEventsList
                    events={filteredEvents}
                    closeMenu={(e: any) => this.closeMenu(e)}
                  />
                </MenuList>
                <Link
                  role="menuitem"
                  to={'/events'}
                  onClick={(e: any) => {
                    e.preventDefault();
                    push('/events');
                    this.closeMenu(e);
                  }}
                >
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
                </Link>
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

  closeMenu = (_: React.MouseEvent<HTMLElement>) => {
    const { markAllSeen } = this.props;
    markAllSeen();
    this.setState({ anchorEl: undefined });
  };
}

const styled = withStyles(styles);

interface DispatchProps {
  markAllSeen: () => Promise<any>;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: ThunkDispatch
) => ({
  markAllSeen: () => dispatch(_markAllSeen())
});

interface StateProps {
  events: Event[];
}
const mapStateToProps: MapState<StateProps, {}> = state => {
  return {
    events: state.events.events
  };
};

const connected = connect(mapStateToProps, mapDispatchToProps);

export default styled(withRouter(connected(UserEventsMenu)));
