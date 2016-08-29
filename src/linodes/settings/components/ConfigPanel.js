import React, { Component, PropTypes } from 'react';
import {
  fetchLinode,
  fetchAllLinodeConfigs,
  deleteLinodeConfig,
} from '~/actions/api/linodes';
import HelpButton from '~/components/HelpButton';
import { Link } from 'react-router';
import { getLinode, loadLinode } from '~/linodes/layouts/LinodeDetailPage';
import { connect } from 'react-redux';

function configContent(linode, configs, dispatch) {
  if (!linode && linode._configs.totalPages === -1) {
    return null;
  }

  if (configs.length === 0) {
    return (
      <p>No configs yet. Add a config.</p>
    );
  }

  return (
    <table className="table configs">
      <thead className="clear-thead">
        <tr>
          <th>Label</th>
          <th>&nbsp;</th>
        </tr>
      </thead>
      <tbody className="hard-border">
        {configs.map(config =>
          <tr key={config.id}>
            <td>
              <Link
                to={`/linodes/${linode.id}/configs/${config.id}`}
              >
                {config.label}
              </Link>
            </td>
            <td>
              {configs.length > 1 ? <a
                className="delete-button"
                onClick={e => {
                  e.preventDefault();
                  dispatch(deleteLinodeConfig(linode.id, config.id));
                }}
                className="action-link pull-right"
                href="#"
              >Delete</a> : null}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export class ConfigPanel extends Component {
  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
    this.loadLinode = loadLinode.bind(this);
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    let linode = this.getLinode();
    if (!linode) {
      const { linodeId } = this.props.params;
      await dispatch(fetchLinode(linodeId));
      linode = this.getLinode();
    }
    if (linode._configs.totalPages === -1) {
      await dispatch(fetchAllLinodeConfigs(linode.id));
    }
  }

  render() {
    const linode = this.getLinode();
    const configs = Object.values(linode._configs.configs);
    const { dispatch } = this.props;

    const content = configContent(linode, configs, dispatch);

    return (
      <div className="linode-configs sm-col-12">
        <div className="row">
          <div className="col-sm-6 left">
            <h3>Configs<HelpButton to="http://example.org" /></h3>
          </div>
          <div className="col-sm-6 content-col right">
            <div className="input-group">
              <a
                href={`/linodes/${linode.id}/configs/create`}
                className="btn btn-default pull-right"
              >
                Add a config
              </a>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12">
            {content}
          </div>
        </div>
      </div>
    );
  }
}

ConfigPanel.propTypes = {
  dispatch: PropTypes.func.isRequired,
  params: PropTypes.shape({
    linodeId: PropTypes.string,
  }),
};

function select(state) {
  return { linodes: state.api.linodes };
}

export default connect(select)(ConfigPanel);
