import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import Card from 'linode-components/dist/cards/Card';
import CardHeader from 'linode-components/dist/cards/CardHeader';
import Table from 'linode-components/dist/tables/Table';
import ButtonCell from 'linode-components/dist/tables/cells/ButtonCell';

import EditSOARecord from '../components/EditSOARecord';


export function SlaveZone(props) {
  const { domain, dispatch } = props;

  const { axfr_ips, master_ips } = domain;

  const soaRecord = {
    ...domain,
    axfr_ips: axfr_ips.map(ip => <div key={ip}>{ip}</div>),
    master_ips: master_ips.map(ip => <div key={ip}>{ip}</div>),
  };

  return (
    <div>
      <header className="main-header main-header--border">
        <div className="container">
          <Link to="/domains">Domains</Link>
          <h1 title={domain.id}>
            {domain.group ? `${domain.group} / ` : ''}
            {domain.domain}
          </h1>
        </div>
      </header>
      <div className="container">
        <Card
          id="soa"
          header={
            <CardHeader title="SOA Record" />
          }
        >
          <Table
            className="Table--secondary"
            columns={[
              { dataKey: 'domain', label: 'Primary Domain' },
              { dataKey: 'axfr_ips', label: 'Domain Transfers' },
              { dataKey: 'master_ips', label: 'Masters' },
              {
                cellComponent: ButtonCell,
                headerClassName: 'ButtonColumn',
                text: 'Edit',
                onClick: () => EditSOARecord.trigger(dispatch, domain),
              },
            ]}
            data={[soaRecord]}
          />
        </Card>
      </div>
    </div>
  );
}

SlaveZone.propTypes = {
  dispatch: PropTypes.func.isRequired,
  domain: PropTypes.object.isRequired,
};

export default connect()(SlaveZone);
