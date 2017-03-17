import React, { PropTypes, Component } from 'react';
import { push } from 'react-router-redux';

import { Card } from '~/components/cards';
import { Form, FormGroup, SubmitButton, Select } from '~/components/form';
import { ErrorSummary, reduceErrors } from '~/errors';
import IPList from './IPList';
import { assignIps, linodeIPs } from '~/api/linodes';
import { linodes as apiLinodes } from '~/api';

export default class IPTransfer extends Component {
  constructor(props) {
    super(props);

    // Need to be able to update immediately and when props change.
    this._componentWillReceiveProps((state) => {
      this.state = {
        ...state,
        errors: {},
        saving: false,
        checkedA: {},
        checkedB: {},
      };
    })(props);
    this.componentWillReceiveProps = this._componentWillReceiveProps();
  }

  onSubmit = async () => {
    const { dispatch, linode, linodes } = this.props;
    const { checkedA, checkedB, selectedOtherLinode } = this.state;

    this.setState({ errors: {}, saving: true });

    const otherLinode = linodes[selectedOtherLinode];
    // checkedA ips go to selectedOtherLinode, checkedB ips go here
    const assignments = [];
    Object.keys(checkedA).forEach(address => {
      if (checkedA[address]) {
        assignments.push({ address, linode_id: otherLinode.id });
      }
    });
    Object.keys(checkedB).forEach(address => {
      if (checkedB[address]) {
        assignments.push({ address, linode_id: linode.id });
      }
    });

    try {
      await dispatch(assignIps(linode.datacenter.id, assignments));

      // Needs to refresh ips for both Linodes
      await dispatch(apiLinodes.one([linode.id]));
      await dispatch(linodeIPs(linode.id));
      dispatch(apiLinodes.one([otherLinode.id]));
      dispatch(linodeIPs(otherLinode.id));

      dispatch(push(`/linodes/${linode.label}`));
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

  otherLinodes(props) {
    const { linodes, linode } = (props || this.props);
    return Object.values(linodes).filter(l => l.id !== linode.id);
  }

  _componentWillReceiveProps(_setState) {
    const setState = _setState || this.setState.bind(this);
    return (nextProps) => {
      const otherLinodes = this.otherLinodes(nextProps);
      const { selectedOtherLinode } = (this.state || {});
      setState({
        selectedOtherLinode: selectedOtherLinode || otherLinodes[0].id,
      });
    };
  }

  render() {
    const { errors, saving, selectedOtherLinode, checkedA, checkedB } = this.state;
    const { linode, linodes } = this.props;

    return (
      <Card title="IP Transfer">
        <p>
          <small>
            The selected IP addresses will be transferred between this Linode (A) and the selected
            Linode (B).
          </small>
        </p>
        <Form onSubmit={this.onSubmit}>
          <FormGroup className="row">
            <div className="col-sm-6">
              <label className="col-form-label">Linode A:</label>
              <span>{linode.label}</span>
            </div>
            <div className="col-sm-6">
              <label className="col-form-label">Linode B:</label>
              <Select
                value={selectedOtherLinode}
                name="selectedOtherLinode"
                onChange={({ record: { name, value } }) =>
                  this.setState({ [name]: value, checkedB: {} })}
                options={this.otherLinodes().map(linode => ({ ...linode, value: linode.id }))}
              />
            </div>
          </FormGroup>
          <FormGroup className="row">
            <div className="col-sm-6" id="sectionA">
              <IPList
                linode={linode}
                checked={checkedA}
                onChange={(record, checked) => {
                  this.setState({
                    checkedA: {
                      [record.address]: checked,
                    },
                  });
                }}
              />
            </div>
            <div className="col-sm-6" id="sectionB">
              <IPList
                linode={linodes[selectedOtherLinode]}
                checked={checkedB}
                onChange={(record, checked) => {
                  this.setState({
                    checkedB: {
                      [record.address]: checked,
                    },
                  });
                }}
              />
            </div>
          </FormGroup>
          <SubmitButton disabled={saving}>Transfer IPs</SubmitButton>
          <ErrorSummary errors={errors} />
        </Form>
      </Card>
    );
  }
}

IPTransfer.propTypes = {
  linode: PropTypes.object.isRequired,
  linodes: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};
