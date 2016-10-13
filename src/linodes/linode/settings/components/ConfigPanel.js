import React, { Component, PropTypes } from 'react';
import HelpButton from '~/components/HelpButton';
import { Link } from 'react-router';
import { getLinode, loadLinode } from '~/linodes/linode/layouts/IndexPage';
import { linodes } from '~/api';

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
    <table>
      <thead className="clear-thead">
        <tr>
          <th>Label</th>
          {configs.length > 1 ? <th></th> : null}
        </tr>
      </thead>
      <tbody>
        {configs.map(config =>
          <tr key={config.id}>
            <td>
              <Link
                to={`/linodes/${linode.id}/settings/advanced/configs/${config.id}`}
              >
                {config.label}
              </Link>
            </td>
            {configs.length > 1 ? <td className="text-xs-right">
              <a
                className="delete-button"
                onClick={e => {
                  e.preventDefault();
                  dispatch(linodes.configs.delete(linode.id, config.id));
                }}
                className="action-link pull-right"
                href="#"
              >Delete</a></td> : null}
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
    const { linodeId } = this.props.params;
    await dispatch(linodes.one(linodeId));
    await dispatch(linodes.configs.all(linodeId));
  }

  render() {
    const linode = this.getLinode();
    const configs = Object.values(linode._configs.configs);
    const { dispatch } = this.props;

    const content = configContent(linode, configs, dispatch);

    return (
      <div>
        <header className="clearfix">
          <h2 className="pull-xs-left">Configs<HelpButton to="http://example.org" /></h2>
          <a
            href={`/linodes/${linode.id}/settings/advanced/configs/create`}
            className="btn btn-default pull-xs-right"
          >
            Add a config
          </a>
        </header>
        {content}
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
