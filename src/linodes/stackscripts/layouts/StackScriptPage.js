import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { Card, CardHeader } from 'linode-components/cards';

import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import { distributions, stackscripts } from '~/api';

import { Editor, Settings } from '../components';


export class StackScriptPage extends Component {
  static async preload({ dispatch, getState }, { stackscriptId }) {
    const requests = [stackscripts.one([stackscriptId])];

    if (!getState().api.distributions.ids.length) {
      requests.push(distributions.all());
    }

    return Promise.all(requests.map(dispatch));
  }

  async componentDidMount() {
    const { dispatch, stackscript } = this.props;
    dispatch(setSource(__filename));
    dispatch(setTitle(stackscript.label));
  }

  render() {
    const { stackscript, dispatch, distributions } = this.props;

    return (
      <div>
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
                    distributions={distributions}
                  />
                </Card>
              </section>
              <Card header={<CardHeader title="Tips" />}>
                <p>
                  Check out the StackScript <a href="https://www.linode.com/docs/platform/stackscripts">documentation</a>. But keep in mind:
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
  distributions: PropTypes.object.isRequired,
};

function select(state, props) {
  return {
    stackscript: state.api.stackscripts.stackscripts[props.params.stackscriptId],
    distributions: state.api.distributions.distributions,
  };
}

export default connect(select)(StackScriptPage);
