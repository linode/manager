import _ from 'lodash';
import React, { PropTypes, Component } from 'react';

import { Card, CardHeader } from 'linode-components/cards';
import { Form, FormGroup, SubmitButton } from 'linode-components/forms';
import { Table } from 'linode-components/tables';
import {
  CheckboxCell,
  LinkCell,
} from 'linode-components/tables/cells';

import { setShared } from '~/api/linodes';
import { dispatchOrStoreErrors, FormSummary } from '~/components/forms';
import { IPRdnsCell } from '~/components/tables/cells';


export default class IPSharing extends Component {
  constructor(props) {
    super(props);

    // Need to be able to update immediately and when props change.
    this._componentWillReceiveProps((state) => {
      this.state = {
        ...state,
        errors: {},
        loading: false,
      };
    })(props);
    this.componentWillReceiveProps = this._componentWillReceiveProps();
  }

  onSubmit = () => {
    const { dispatch, linode } = this.props;
    const { checked } = this.state;

    const sharedIps = Object.keys(_.pickBy(checked, checked => checked));

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => setShared(linode.id, sharedIps),
    ]));
  }

  onChange = (record, checked) => {
    this.setState(_.merge({}, this.state, {
      checked: {
        [record.ip.address]: checked,
      },
    }));
  }

  _componentWillReceiveProps(_setState) {
    const setState = _setState || this.setState.bind(this);
    return (nextProps) => {
      const { linode } = nextProps;
      const checked = {};
      const validIPs = this.validIPs(nextProps);

      validIPs.forEach(({ ip: { address } }) => {
        checked[address] = (linode._ips.ipv4.shared || []).filter(
          ip => ip.address === address).length !== 0;
      });

      setState({
        checked: _.merge({}, checked, this.state ? this.state.checked : {}),
      });
    };
  }

  validIPs(props = undefined) {
    const { linodes, linode: thisLinode } = props || this.props;

    const data = _.flatten(linodes
      .filter((linode) => { return linode.id !== thisLinode.id; })
      .map((linode) => {
        const shareableIps = linode._ips.ipv4.public;
        return shareableIps.map((ip) => {
          return { ip: ip, linode: linode };
        });
      }));

    return data;
  }

  render() {
    const { errors, loading } = this.state;
    const { checked } = this.state;
    const data = this.validIPs();

    let body = (
      <p>
        Sharing is only available within Linodes in the same region. There are no other Linodes
        in this region.
      </p>
    );

    if (data.length) {
      body = (
        <div>
          <p>
            <small>
              The selected IP addresses can be brought up by this Linode if the original Linode's
              host becomes unavailable.
            </small>
          </p>
          <Form onSubmit={this.onSubmit}>
            <FormGroup>
              <Table
                className="Table--secondary"
                columns={[
                  {
                    cellComponent: CheckboxCell,
                    headerClassName: 'CheckboxColumn',
                    selectedKeyFn: (record) => {
                      return record.ip.address;
                    },
                  },
                  { cellComponent: IPRdnsCell, ipKey: 'ip', label: 'IP Address' },
                  {
                    cellComponent: LinkCell,
                    hrefFn: (record) => {
                      return `/linodes/${record.linode.label}`;
                    },
                    label: 'Linode',
                    textFn: (record) => {
                      return record.linode.label;
                    },
                  },
                ]}
                data={data}
                selectedMap={checked}
                onToggleSelect={this.onChange}
              />
            </FormGroup>
            <FormGroup>
              <SubmitButton disabled={loading} />
              <FormSummary errors={errors} success="Shared IPs saved." />
            </FormGroup>
          </Form>
        </div>
      );
    }

    return (
      <Card header={<CardHeader title="IP Sharing" />}>{body}</Card>
    );
  }
}

IPSharing.propTypes = {
  linode: PropTypes.object.isRequired,
  linodes: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired,
};
