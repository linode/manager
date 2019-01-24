import { InjectedNotistackProps, withSnackbar } from 'notistack';
import { shim } from 'promise.prototype.finally';
import { path } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { Action, compose } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { Subscription } from 'rxjs/Subscription';
import {
  DocumentTitleSegment,
  withDocumentTitleProvider
} from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import SideMenu from 'src/components/SideMenu';
import { events$ } from 'src/events';
import BackupDrawer from 'src/features/Backups';
import DomainCreateDrawer from 'src/features/Domains/DomainCreateDrawer';
import Footer from 'src/features/Footer';
import ToastNotifications from 'src/features/ToastNotifications';
import TopMenu from 'src/features/TopMenu';
import VolumeDrawer from 'src/features/Volumes/VolumeDrawer';
import { requestAccountSettings } from 'src/store/accountSettings/accountSettings.requests';
import { requestDomains } from 'src/store/domains/domains.actions';
import { requestImages } from 'src/store/image/image.requests';
import { requestLinodes } from 'src/store/linodes/linodes.actions';
import { requestTypes } from 'src/store/linodeType/linodeType.requests';
import { requestNotifications } from 'src/store/notification/notification.requests';
import { requestProfile } from 'src/store/profile/profile.requests';
import { requestRegions } from 'src/store/regions/regions.actions';
import composeState from 'src/utilities/composeState';
import { notifications, theme as themeStorage } from 'src/utilities/storage';
import WelcomeBanner from 'src/WelcomeBanner';
import styled,{StyleProps} from './Layout.styles';
import Routes from './Routes';
import { MapState } from './store/types';

shim(); // allows for .finally() usage

interface Props {
  toggleTheme: () => void;
}

interface State {
  menuOpen: boolean;
  welcomeBanner: boolean;
}

type CombinedProps =
  & Props
  & DispatchProps
  & StateProps
  & StyleProps
  & InjectedNotistackProps;

export class Layout extends React.Component<CombinedProps, State> {
  composeState = composeState;

  eventsSub: Subscription;

  state: State = {
    menuOpen: false,
    welcomeBanner: false
  };

  componentDidMount() {
    const { actions } = this.props;

    actions.requestDomains();
    actions.requestImages();
    actions.requestLinodes();
    actions.requestNotifications();
    actions.requestProfile();
    actions.requestSettings();
    actions.requestTypes();
    actions.requestRegions();

    /*
     * We want to listen for migration events side-wide
     * It's unpredictable when a migration is going to happen. It could take
     * hours and it could take days. We want to notify to the user when it happens
     * and then update the Linodes in LinodesDetail and LinodesLanding
     */
    this.eventsSub = events$
      .filter(
        event => !event._initial && ['linode_migrate'].includes(event.action)
      )
      .subscribe(event => {
        const { entity: migratedLinode } = event;
        if (event.action === 'linode_migrate' && event.status === 'finished') {
          this.props.enqueueSnackbar(
            `Linode ${migratedLinode!.label} migrated successfully.`,
            {
              variant: 'success'
            }
          );
        }

        if (event.action === 'linode_migrate' && event.status === 'failed') {
          this.props.enqueueSnackbar(
            `Linode ${migratedLinode!.label} migration failed.`,
            {
              variant: 'error'
            }
          );
        }
      });

    if (notifications.welcome.get() === 'open') {
      this.setState({ welcomeBanner: true });
    }
  }

  closeMenu = () => {
    this.setState({ menuOpen: false });
  };
  openMenu = () => {
    this.setState({ menuOpen: true });
  };

  toggleMenu = () => {
    this.setState({
      menuOpen: !this.state.menuOpen
    });
  };

  closeWelcomeBanner = () => {
    this.setState({ welcomeBanner: false });
    notifications.welcome.set('closed');
  };

  render() {
    const { menuOpen } = this.state;
    const { classes, toggleTheme, profileLoading, profileError } = this.props;

    if (profileError) {
      throw profileError;
    }

    return (
      <React.Fragment>
        <a href="#main-content" className="visually-hidden">
          Skip to main content
        </a>
        <DocumentTitleSegment segment="Linode Manager" />

        {profileLoading === false && (
          <React.Fragment>
            <div {...themeDataAttr()} className={classes.appFrame}>
              <SideMenu
                open={menuOpen}
                closeMenu={this.closeMenu}
                toggleTheme={toggleTheme}
              />
              <main className={classes.content}>
                <TopMenu openSideMenu={this.openMenu} />
                <div className={classes.wrapper} id="main-content">
                  <Grid container spacing={0} className={classes.grid}>
                    <Grid item className={classes.switchWrapper}>
                      <Routes />
                    </Grid>
                  </Grid>
                </div>
              </main>
              <Footer />
              <WelcomeBanner
                open={this.state.welcomeBanner}
                onClose={this.closeWelcomeBanner}
                data-qa-beta-notice
              />
              <ToastNotifications />
              <DomainCreateDrawer />
              <VolumeDrawer />
              <BackupDrawer />
            </div>
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}

const themeDataAttr = () => {
  if (themeStorage.get() === 'dark') {
    return {
      'data-qa-theme-dark': true
    };
  }
  return {
    'data-qa-theme-light': true
  };
};

interface DispatchProps {
  actions: {
    requestDomains: () => void;
    requestImages: () => void;
    requestLinodes: () => void;
    requestNotifications: () => void;
    requestProfile: () => void;
    requestSettings: () => void;
    requestTypes: () => void;
    requestRegions: () => void;
  };
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, Props> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, Action<any>>
) => {
  return {
    actions: {
      requestDomains: () => dispatch(requestDomains()),
      requestImages: () => dispatch(requestImages()),
      requestLinodes: () => dispatch(requestLinodes()),
      requestNotifications: () => dispatch(requestNotifications()),
      requestProfile: () => dispatch(requestProfile()),
      requestSettings: () => dispatch(requestAccountSettings()),
      requestTypes: () => dispatch(requestTypes()),
      requestRegions: () => dispatch(requestRegions())
    }
  };
};

interface StateProps {
  /** Profile */
  profileLoading: boolean;
  profileError?: Error | Linode.ApiFieldError[];
  userId?: number;

  documentation: Linode.Doc[];
}

const mapStateToProps: MapState<StateProps, Props> = (state, ownProps) => ({
  /** Profile */
  profileLoading: state.__resources.profile.loading,
  profileError: state.__resources.profile.error,
  userId: path(['data', 'uid'], state.__resources.profile),

  documentation: state.documentation
});

export const connected = connect(
  mapStateToProps,
  mapDispatchToProps
);

export default compose(
  connected,
  styled,
  withDocumentTitleProvider,
  withSnackbar
)(Layout);
