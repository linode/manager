import React, { PropTypes, Component } from 'react';

import { Card, CardHeader } from 'linode-components/cards';
import { Form, FormGroup, SubmitButton, Select } from 'linode-components/forms';

import { linodes as apiLinodes } from '~/api';
import { createHeaderFilter } from '~/api/util';
import { linodeIPs } from '~/api/linodes';
import { assignIPs } from '~/api/networking';
import { dispatchOrStoreErrors, FormSummary } from '~/components/forms';

import IPList from './IPList';


export default class IPTransfer extends Component {
  constructor(props) {
    super(props);

    // Need to be able to update immediately and when props change.
    this._componentWillReceiveProps((state) => {
      this.state = {
        ...state,
        errors: {},
        loading: false,
        checkedA: {},
        checkedB: {},
      };
    })(props);
    this.componentWillReceiveProps = this._componentWillReceiveProps();
  }

  onSubmit = () => {
    const { dispatch, linode, linodes } = this.props;
    const { checkedA, checkedB, selectedOtherLinode } = this.state;

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

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => assignIPs(linode.region.id, assignments),
      () => (dispatch) => Promise.all([
        dispatch(apiLinodes.all([], undefined, createHeaderFilter({
          '+or': [{ label: linode.label }, { label: otherLinode.label }],
        }))),
        dispatch(linodeIPs(linode.id)),
        dispatch(linodeIPs(otherLinode.id)),
      ]),
    ]));
  }

  otherLinodes(props) {
    const { linodes, linode } = (props || this.props);
    return Object.values(linodes).filter(l => l.id !== linode.id);
  }

  _componentWillReceiveProps(_setState) {
    const setState = _setState || this.setState.bind(this);
    return (nextProps) => {
      const otherLinode = this.otherLinodes(nextProps)[0] || {};
      const { selectedOtherLinode } = (this.state || {});
      setState({
        selectedOtherLinode: selectedOtherLinode || otherLinode.id,
      });
    };
  }

  render() {
    const { errors, loading, selectedOtherLinode, checkedA, checkedB } = this.state;
    const { linode, linodes } = this.props;

    let body = (
      <p>
        Transfer is only available within Linodes in the same region. There are no other
        Linodes in this region.
      </p>
    );

    if (selectedOtherLinode) {
      body = (
        <div>
          <p>
            <small>
              The selected IP addresses will be transferred between this Linode (A) and the selected
              Linode (B).
            </small>
          </p>
          <Form onSubmit={this.onSubmit}>
            <FormGroup className="row">
              <div className="col-lg-6 col-md-12 col-sm-12">
                <label className="col-form-label">Linode A:</label>
                <span>{linode.label}</span>
              </div>
              <div className="col-lg-6 col-md-12 col-sm-12">
                <label className="col-form-label">Linode B:</label>
                <Select
                  value={selectedOtherLinode}
                  name="selectedOtherLinode"
                  onChange={({ target: { name, value } }) =>
                    this.setState({ [name]: value, checkedB: {} })}
                  options={this.otherLinodes().map(linode => ({ ...linode, value: linode.id }))}
                />
              </div>
            </FormGroup>
            <FormGroup className="row">
              <div className="col-lg-6 col-md-12 col-sm-12" id="sectionA">
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
              <div className="col-lg-6 col-md-12 col-sm-12" id="sectionB">
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
            <SubmitButton disabled={loading} disabledChildren="Transferring">Transfer</SubmitButton>
            <FormSummary errors={errors} success="Transfer complete." />
          </Form>
        </div>
      );
    }

    return (
      <Card header={<CardHeader title="IP Transfer" />}>{body}</Card>
    );
  }
}

IPTransfer.propTypes = {
  linode: PropTypes.object.isRequired,
  linodes: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};
