import React from 'react';
import { connect } from 'react-redux';
import { snapshotPanel } from '~/linodes/linode/backups/components/SnapshotPanel';
import { restorePanel } from '~/linodes/linode/backups/components/RestorePanel';

export function SummaryPage() {
  return (
    <div>
      {snapshotPanel()}
      {restorePanel()}
    </div>
  );
}

function select(state) {
  return { linodes: state.api.linodes };
}

export default connect(select)(SummaryPage);
