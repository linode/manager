import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';

function Layout(props) {
  const { username } = props;
  return (
    <div className="layout">
      <Header username={username} />
      <Sidebar />
      <div className="main">
        <div className="container">
          <Modal />
          {props.children}
        </div>
      </div>
    </div>
  );
}

Layout.propTypes = {
  username: PropTypes.string,
  children: PropTypes.node.isRequired,
};

function select(state) {
  return { username: state.authentication.username };
}

export default connect(select)(Layout);
