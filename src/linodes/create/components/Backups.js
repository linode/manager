import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { linodes } from '~/api';
import Backup from '~/linodes/components/Backup';

export class Backups extends Component {
  async componentDidMount() {
    const { selectedLinode, dispatch } = this.props;
    await dispatch(linodes.backups.all([selectedLinode]));
  }

  render() {
    const {
      linodes,
      selectedLinode,
      selected,
      onSourceSelected,
      goBack,
    } = this.props;
    const l = linodes.linodes[selectedLinode];
    return (
      <section>
        <div key={l.id}>
          <h3>
            {l.label}
          </h3>
          <div className="backup-group clearfix">
            {_.map(l._backups.backups, backup =>
              <Backup
                backup={backup}
                selected={selected}
                onSelect={() => onSourceSelected(backup.id)}
                key={backup.created}
              />
             )}
          </div>
          <a
            href="#"
            className="back"
            onClick={goBack}
          >Need a different Linode?</a>
        </div>
      </section>
    );
  }
}

Backups.propTypes = {
  linodes: PropTypes.object,
  selectedLinode: PropTypes.number,
  dispatch: PropTypes.func,
  onSourceSelected: PropTypes.func.isRequired,
  selected: PropTypes.number,
  goBack: PropTypes.func,
};

function select(state) {
  return {
    linodes: state.api.linodes,
  };
}

export default connect(select)(Backups);
