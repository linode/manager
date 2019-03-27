import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Fade from '@material-ui/core/Fade';
import Popper from '@material-ui/core/Popper';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import ListItem from 'src/components/core/ListItem';
import MenuList from 'src/components/core/MenuList';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import { markAllSeen } from 'src/store/events/event.request';
import { MapState, ThunkDispatch } from 'src/store/types';
import UserEventsButton from './UserEventsButton';
import UserEventsList from './UserEventsList';
import UserEventsListItem from './UserEventsListItem';

type ClassNames = 'root' | 'dropDown' | 'hidden' | 'viewAll';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    transform: `translate(-${theme.spacing.unit * 2}px, ${
      theme.spacing.unit
    }px)`,
    boxShadow: `0 0 5px ${theme.color.boxShadow}`
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
    borderTop: `1px solid ${theme.palette.divider}`
  }
});

interface State {
  anchorEl?: HTMLElement;
}

type CombinedProps = StateProps &
  DispatchProps &
  RouteComponentProps<void> &
  WithStyles<ClassNames>;

class UserEventsMenu extends React.Component<CombinedProps, State> {
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
        <Popper
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          transition
          disablePortal
        >
          {({ TransitionProps, placement }) => (
            <Fade
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === 'bottom' ? 'center top' : 'center bottom'
              }}
            >
              <ClickAwayListener onClickAway={this.closeMenu}>
                <Paper className={classes.root}>
                  <MenuList className={classes.dropDown}>
                    <ListItem
                      key="placeholder"
                      className={classes.hidden}
                      tabIndex={1}
                    />
                    <UserEventsList
                      events={events}
                      closeMenu={this.closeMenu}
                    />
                  </MenuList>
                  <UserEventsListItem
                    data-qa-view-all-events
                    title="View All Events"
                    className={classes.viewAll}
                    onClick={(e: any) => {
                      push('/events');
                      this.closeMenu(e);
                    }}
                  />
                </Paper>
              </ClickAwayListener>
            </Fade>
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
