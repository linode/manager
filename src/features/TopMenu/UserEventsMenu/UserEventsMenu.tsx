import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import ListItem from 'src/components/core/ListItem';
import Menu from 'src/components/core/Menu';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import { markAllSeen } from 'src/store/events/event.request';
import { MapState, ThunkDispatch } from 'src/store/types';
import UserEventsButton from './UserEventsButton';
import UserEventsList from './UserEventsList';

type ClassNames = 'root' | 'dropDown' | 'hidden';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    transform: `translate(-${theme.spacing.unit * 2}px, ${
      theme.spacing.unit
    }px)`
  },
  dropDown: {
    position: 'absolute',
    outline: 0,
    boxShadow: `0 0 5px ${theme.color.boxShadow}`,
    overflowY: 'auto',
    overflowX: 'hidden',
    minHeight: 16,
    width: 250,
    maxHeight: 300,
    [theme.breakpoints.up('sm')]: {
      width: 380
    }
  },
  hidden: {
    height: 0,
    padding: 0
  }
});

interface State {
  anchorEl?: HTMLElement;
}

type CombinedProps = StateProps & DispatchProps & WithStyles<ClassNames>;

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
    const { classes, events, unseenCount } = this.props;

    return (
      <React.Fragment>
        <UserEventsButton
          onClick={this.openMenu}
          count={unseenCount}
          disabled={events.length === 0}
          className={anchorEl ? 'active' : ''}
        />
        <Menu
          anchorEl={anchorEl}
          getContentAnchorEl={undefined}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={Boolean(anchorEl)}
          onClose={this.closeMenu}
          className={classes.root}
          PaperProps={{ className: classes.dropDown }}
        >
          <ListItem key="placeholder" className={classes.hidden} tabIndex={1} />
          <UserEventsList events={events} closeMenu={this.closeMenu} />
        </Menu>
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

export default styled(connected(UserEventsMenu));
