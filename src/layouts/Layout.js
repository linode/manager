import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import { toggleDetails } from '~/actions/errors';
import NotFound from './NotFound';

export class Layout extends Component {
  constructor() {
    super();
    this.renderError = this.renderError.bind(this);
  }

  renderError() {
    const { dispatch, errors } = this.props;
    if (errors.status === 404) {
      return <div className="container"><NotFound /></div>;
    }
    return (
      <div
        className="container centered"
        style={{ marginTop: '5rem' }}
      >
        <h1>{errors.status} {errors.statusText}</h1>
        <p>
          Something broke. Sorry about that.
        </p>
        <div>
          <button
            style={{ margin: '0 0.51rem' }}
            className="btn btn-default"
            onClick={() => window.location.reload(true)}
          >Reload</button>
          <a
            style={{ margin: '0 0.5rem' }}
            href={`mailto:support@linode.com?subject=${
              encodeURIComponent(`${errors.status} ${errors.statusText}`)
            }&body=${
              encodeURIComponent(
                `I'm getting the following error on ${
                  window.location.href
                }:\n\n${
                  JSON.stringify(errors.json, null, 4)
                }`
              )
            }`}
            className="btn btn-default"
          >Contact Support</a>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <a
            className="toggle-error-response"
            href="#"
            onClick={e => {
              e.preventDefault();
              dispatch(toggleDetails());
            }}
          >{errors.details ? 'Hide' : 'Show'} Response JSON</a>
          {errors.details ?
            <pre
              style={{
                textAlign: 'left',
                maxHeight: '20rem',
                width: '40rem',
                margin: '0 auto',
              }}
            >{JSON.stringify(errors.json, null, 4)}</pre>
          : null}
        </div>
      </div>);
  }

  render() {
    const { username, errors } = this.props;
    return (
      <div className="layout">
        <Header username={username} />
        <Sidebar />
        <div className="main">
          {errors.status === null ?
            <div className="container">
              <Modal />
              {this.props.children}
            </div> : this.renderError()}
        </div>
      </div>
    );
  }
}

Layout.propTypes = {
  username: PropTypes.string,
  children: PropTypes.node.isRequired,
  errors: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

function select(state) {
  return {
    username: state.authentication.username,
    errors: state.errors,
  };
}

export default connect(select)(Layout);
