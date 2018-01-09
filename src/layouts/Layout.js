import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';

import withRouter from '~/decorators/withRouter';
import ModalShell from 'linode-components/dist/modals/ModalShell';
import { hideModal } from '~/actions/modal';
import isAuthenticated from '~/decorators/isAuthenticated';
import NavigationLink from './NavigationLink';
import Navigation from './Navigation';
import Footer from './Footer';
import MiniHeader from './MiniHeader';

const LinodeContextMenu = () => {
  const links = [
    { to: '/stackscripts', label: 'StackScripts', linkClass: 'ContextHeader-link' },
    { to: '/images', label: 'Images', linkClass: 'ContextHeader-link' },
    { to: '/volumes', label: 'Volumes', linkClass: 'ContextHeader-link' },
  ];

  return (
    <div className="ContextHeader">
      <div className="container">
        <div className="Menu">
          {links.map((props, key) => (
            <div className="Menu-item" key={key}>
              {React.createElement(NavigationLink, props)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ContextNavigation = () => (
  <div>
    <Route path="/linodes" render={LinodeContextMenu} />
    <Route path="/images" component={LinodeContextMenu} />
    <Route path="/stackscripts" component={LinodeContextMenu} />
    <Route path="/volumes" component={LinodeContextMenu} />
  </div>
);

export const Layout = ({
  component: WrappedComponent,
  title,
  /** Provided by react-redux connect */
  dispatch,
  modal,
  ...rest
}) => {
  return (
    <Route
      {...rest}
      render={(matchProps) => {
        return (
          <div className="Layout" >
            <div className="Layout-inner">
              {/*
                Should ModalShell be here? Maybe a level higher in the index to prevent
                unnecessary renders?
              */}
              <ModalShell
                open={modal.open}
                title={modal.title}
                close={() => dispatch(hideModal())}
              >
                {modal.body}
              </ModalShell>
              <div className="Header">
                <MiniHeader />
                <Navigation />
                <ContextNavigation />
              </div>
              <WrappedComponent title={title} {...matchProps} />
              <Footer />
            </div>
          </div>
        );
      }}
    />
  );
};

Layout.propTypes = {
  dispatch: PropTypes.func,
  modal: PropTypes.shape({
    open: PropTypes.bool,
    title: PropTypes.string,
    close: PropTypes.func,
    body: PropTypes.object,
  }),
  component: PropTypes.func,
  title: PropTypes.string,
};

const mapStateToProps = (state) => ({
  notificationsOpen: state.notifications.open,
  sessionOpen: state.session.open,
  modal: state.modal,
});

const mapDispatchToProps = (dispatch) => ({
  dispatch,
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withRouter,
  isAuthenticated
)(Layout);
