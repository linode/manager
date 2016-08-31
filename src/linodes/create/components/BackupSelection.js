import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import { fetchBackups } from '~/actions/api/backups';
import Backup from '~/linodes/components/Backup';

export class BackupSelection extends Component {
  async componentDidMount() {
    const { linodes, selectedLinode, dispatch } = this.props;
    const l = linodes.linodes[selectedLinode];
    if (l.backups.enabled && l._backups.totalPages === -1) {
      await dispatch(fetchBackups(0, selectedLinode));
    }
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
      <div className="clearfix">
        <div className="pull-right">
          <a href="#" className="back" onClick={goBack}>Back</a>
        </div>
        <div key={l.id}>
          <h3>{l.label}</h3>
          <div className="backup-group">
            {_.map(l._backups.backups, backup =>
              <Backup
                backup={backup}
                selected={selected}
                onSelect={() => onSourceSelected(backup.id)}
                key={backup.created}
              />
             )}
          </div>
        </div>
      </div>
    );
  }
}

BackupSelection.propTypes = {
  linodes: PropTypes.object,
  selectedLinode: PropTypes.string,
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

export default connect(select)(BackupSelection);
