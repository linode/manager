import React, { PropTypes, Component } from 'react';

import _ from 'lodash';
import { Card } from '~/components/cards';
import { Form, FormGroup, SubmitButton } from '~/components/form';
import { Table } from '~/components/tables';
import {
  CheckboxCell,
  LinkCell,
  IPRdnsCell,
} from '~/components/tables/cells';
import { ErrorSummary, reduceErrors } from '~/errors';
import { setShared } from '~/api/linodes';


export default class IPSharing extends Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    // Need to be able to update immediately and when props change.
    this._componentWillReceiveProps((state) => {
      this.state = {
        ...state,
        errors: {},
        saving: false,
        checked: {},
      };
    })(props);
    this.componentWillReceiveProps = this._componentWillReceiveProps();
  }

  onSubmit = async () => {
    const { dispatch, linode } = this.props;
    const { checked } = this.state;

    this.setState({ errors: {}, saving: true });

    const sharedIps = Object.keys(_.pickBy(checked, checked => checked));

    try {
      await dispatch(setShared(linode.id, sharedIps));
    } catch (response) {
      if (!response.json) {
        // eslint-disable-next-line no-console
        return console.error(response);
      }

      const errors = await reduceErrors(response);
      this.setState({ errors });
    }

    this.setState({ saving: false });
  }

  onChange(record) {
    this.setState({
      checked: {
        ...this.state.checked,
        [record.ip.address]: !this.state.checked[record.ip.address],
      },
    });
  }

  _componentWillReceiveProps(_setState) {
    const setState = _setState || this.setState.bind(this);
    return (nextProps) => {
      const { linode } = nextProps;
      const checked = {};
      (linode._ips.ipv4.shared || []).forEach(ip => {
        checked[ip.address] = true;
      });
      setState({ checked });
    };
  }

  formatRows() {
    const { linodes, linode: thisLinode } = this.props;

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
    const { errors, saving } = this.state;
    const { checked } = this.state;
    const data = this.formatRows();

    return (
      <Card title="IP Sharing">
        <p>
          <small>
            The selected IP addresses can be brought up by this Linode if the original Linode's
            host becomes unavailable.
          </small>
        </p>
        <Form onSubmit={this.onSubmit}>
          <FormGroup>
            <Table
              className='Table--secondary'
              columns={[
                { cellComponent: CheckboxCell, onChange: this.onChange },
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
              selected={checked}
            />
          </FormGroup>
          <SubmitButton disabled={saving}>Save</SubmitButton>
          <ErrorSummary errors={errors} />
        </Form>
      </Card>
    );
  }
}

IPSharing.propTypes = {
  linode: PropTypes.object.isRequired,
  linodes: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired,
};
