import React from 'react';
import { connect } from 'react-redux';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

function Layout(props) {
  const { username } = props;
  return (
    <div className="layout">
      <Header username={username} />
      <Sidebar />
      <div className="main">
        <div className="container">
          {props.children}
        </div>
      </div>
    </div>
  );
}

function select(state) {
  return { username: state.authentication.username };
}

export default connect(select)(Layout);
