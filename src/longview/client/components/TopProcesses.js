import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

function fixProcessUsername(process) {
  const shifted = Object.entries(process).reduce(
    (result, [key, value]) => ({ ...result, [key.replace('.', '')]: value }),
    {});
  return { '(unknown)': shifted };
}

// Sum specific process stats by all users
function sumProcessAcrossUsers(process) {
  return _.reduce(
    process,
    (result, value, key) => ({
      count: result.count + value.count,
      mem: result.mem + value.mem,
      cpu: result.cpu + value.cpu,
      entries: result.entries + value.entries,
    }),
    {
      count: 0,
      mem: 0,
      cpu: 0,
      entries: 0,
    }
  );
}

export default function TopProcesses(props, state) {
  const topProcesses = props.lvclient._getTopProcesses || {};
  const processes = topProcesses.Processes;

  if (! processes) {
    return null;
  }

  // Turn the complex processes tree into an array of table rows
  const rows = _.reduce(
    processes,
    (result, value, key) => {
      let v = { ...value };

      // some processes are not mapped to users
      // these keys are dot prefixed
      if (v['.entries']) {
        v = fixProcessUsername(v);
      }

      const sums = sumProcessAcrossUsers(v);

      return [
        ...result,
        <tr key={key}>
          <td>{key}</td>
          <td>{parseInt(sums.count)}</td>
          <td>{sums.cpu.toFixed(2)}%</td>
          <td>{Math.round(sums.mem / 1000)} MB</td>
        </tr>,
      ];
    },
    []
  );

  return (
    <section>
      <table className="table table-hover table-sm">
        <thead>
          <tr>
            <th>Name</th>
            <th>Count</th>
            <th>CPU</th>
            <th>Memory</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    </section>
  );
}

TopProcesses.propTypes = {
  processes: PropTypes.object,
  lvclient: PropTypes.object,
  dispatch: PropTypes.func,
};
