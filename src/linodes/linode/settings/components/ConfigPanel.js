import React, { Component, PropTypes } from 'react';
import HelpButton from '~/components/HelpButton';
import { Link } from 'react-router';
import { getLinode } from '~/linodes/linode/layouts/IndexPage';
import { ConfirmModalBody } from '~/components/modals';
import { linodes } from '~/api';
import { showModal, hideModal } from '~/actions/modal';

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
                to={`/linodes/${linode.label}/settings/advanced/configs/${config.id}`}
              >
                {config.label}
              </Link>
            </td>
            {configs.length > 1 ? <td className="text-xs-right">
              <a
                className="delete-button"
                onClick={e => {
                  e.preventDefault();
                  dispatch(showModal('Confirm deletion',
                    <ConfirmModalBody
                      buttonText="Delete config"
                      onOk={async () => {
                        await dispatch(linodes.configs.delete(linode.id, config.id));
                        dispatch(hideModal());
                      }}
                      onCancel={() => dispatch(hideModal())}
                    >
                      Are you sure you want to delete this config?
                      This operation cannot be undone.
                    </ConfirmModalBody>
                  ));
                }}
                className="action-link float-xs-right"
                href="#"
              >Delete</a></td> : null}
          </tr>
        )}
      </tbody>
    </table>
  );
}

export class ConfigPanel extends Component {
  static async preload({ dispatch, getState }, { linodeLabel }) {
    const { id } = Object.values(getState().api.linodes.linodes).reduce(
      (match, linode) => linode.label === linodeLabel ? linode : match);
    await dispatch(linodes.configs.all([id]));
  }

  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
  }

  render() {
    const linode = this.getLinode();
    const configs = Object.values(linode._configs.configs);
    const { dispatch } = this.props;

    const content = configContent(linode, configs, dispatch);

    return (
      <div>
        <header className="clearfix">
          <h2 className="float-xs-left">Configs<HelpButton to="http://example.org" /></h2>
          <Link
            to={`/linodes/${linode.label}/settings/advanced/configs/create`}
            className="btn btn-default float-xs-right"
          >
            Add a config
          </Link>
        </header>
        {content}
      </div>
    );
  }
}

ConfigPanel.propTypes = {
  dispatch: PropTypes.func.isRequired,
  params: PropTypes.shape({
    linodeLabel: PropTypes.string,
  }),
};
