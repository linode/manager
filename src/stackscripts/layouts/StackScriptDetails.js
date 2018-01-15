import PropTypes from 'prop-types';
import filter from 'lodash/filter';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { compose } from 'redux';
import ExternalLink from 'linode-components/dist/buttons/ExternalLink';
import Card from 'linode-components/dist/cards/Card';
import CardHeader from 'linode-components/dist/cards/CardHeader';

import { setSource } from '~/actions/source';
import api from '~/api';
import ChainedDocumentTitle from '~/components/ChainedDocumentTitle';

import { Editor, Settings } from '../components';
import { ComponentPreload as Preload } from '~/decorators/Preload';


export class StackScriptPage extends Component {
  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  render() {
    const { stackscript, dispatch, images } = this.props;

    return (
      <div>
        <ChainedDocumentTitle title={stackscript.label} />
        <header className="main-header main-header--border">
          <div className="container">
            <Link to="/stackscripts">StackScripts</Link>
            <h1 title={stackscript.id}>
              <Link to={`/stackscripts/${stackscript.label}`}>
                {stackscript.label}
              </Link>
            </h1>
          </div>
        </header>
        <div className="container">
          <div className="row">
            <div className="col-md-4">
              <section>
                <Card header={<CardHeader title="Settings" />}>
                  <Settings
                    dispatch={dispatch}
                    stackscript={stackscript}
                    images={filter(images, i => i.is_public)}
                  />
                </Card>
              </section>
              <Card header={<CardHeader title="Tips" />}>
                <p>
                  Check out the StackScript <ExternalLink to="https://www.linode.com/docs/platform/stackscripts">documentation</ExternalLink>. But keep in mind:
                </p>
                <ul>
                  <li>
                    There are four default environment variables provided to you:
                    <ul>
                      <li>LINODE_ID</li>
                      <li>LINODE_LISHUSERNAME</li>
                      <li>LINODE_RAM</li>
                      <li>LINODE_DATACENTERID</li>
                    </ul>
                  </li>
                </ul>
              </Card>
            </div>
            <div className="col-md-8">
              <Card header={<CardHeader title="Editor" />}>
                <Editor
                  dispatch={dispatch}
                  stackscript={stackscript}
                />
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

StackScriptPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  stackscript: PropTypes.object.isRequired,
  images: PropTypes.object.isRequired,
};

function mapStateToProps(state, { match: { params: { stackscriptId } } }) {
  return {
    stackscript: state.api.stackscripts.stackscripts[stackscriptId],
    images: state.api.images.images,
    ids: state.api.images.ids,
  };
}

const preloadRequest = async (dispatch, props) => {
  const {
    ids,
    match: { params: { stackscriptId } },
  } = props;
  const requests = [api.stackscripts.one([stackscriptId])];

  if (!ids.length) {
    requests.push(api.images.all());
  }

  return Promise.all(requests.map(dispatch));
};

export default compose(
  connect(mapStateToProps),
  Preload(preloadRequest)
)(StackScriptPage);
