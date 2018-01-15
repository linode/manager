import pickBy from 'lodash/pickBy';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import Card from 'linode-components/dist/cards/Card';
import CardHeader from 'linode-components/dist/cards/CardHeader';
import Form from 'linode-components/dist/forms/Form';
import FormGroup from 'linode-components/dist/forms/FormGroup';
import FormSummary from 'linode-components/dist/forms/FormSummary';
import SubmitButton from 'linode-components/dist/forms/SubmitButton';
import Select from 'linode-components/dist/forms/Select';

import { setSource } from '~/actions/source';
import { assignIPs } from '~/api/ad-hoc/networking';
import { dispatchOrStoreErrors } from '~/api/util';

import { IPList } from '../components';
import { selectLinode } from '../../utilities';

export class IPTransferPage extends Component {
  constructor() {
    super();

    this.state = {
      errors: {},
      loading: false,
      checkedA: {},
      checkedB: {},
    };

    this.componentWillReceiveProps = this.componentWillMount;
  }

  componentWillMount() {
    const otherLinode = this.otherLinodes()[0] || {};
    const { selectedOtherLinode } = this.state;

    this.setState({
      selectedOtherLinode: selectedOtherLinode || otherLinode.id,
    });
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  onSubmit = () => {
    const { dispatch, linode, linodes } = this.props;
    const { checkedA, checkedB, selectedOtherLinode } = this.state;

    const otherLinode = linodes[selectedOtherLinode];
    // checkedA ips go to selectedOtherLinode, checkedB ips go here
    const assignments = [];
    Object.keys(checkedA).forEach(address => {
      if (checkedA[address]) {
        assignments.push({ ip: linode._ips[address], id: otherLinode.id });
      }
    });
    Object.keys(checkedB).forEach(address => {
      if (checkedB[address]) {
        assignments.push({ ip: otherLinode._ips[address], id: linode.id });
      }
    });

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => assignIPs(linode.region, assignments),
      // This setState is important so that old checked IPs that have transferred don't break
      // things.
      () => this.setState({ checkedA: {}, checkedB: {} }),
    ]));
  }

  otherLinodes() {
    const { linodes, linode } = this.props;
    return Object.values(pickBy(linodes, l => l.region === linode.region))
      .filter(l => l.id !== linode.id);
  }

  render() {
    const { errors, loading, selectedOtherLinode, checkedA, checkedB } = this.state;
    const { linodes, linode } = this.props;

    // Although we only explicitly looked up all linodes in the current dc,
    // other linodes may already exist in the state.
    const linodesInRegion = this.otherLinodes();

    let body = (
      <p>
        Transfer is limited to Linodes in the same region. You have no other
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
          <Form
            onSubmit={this.onSubmit}
            analytics={{ title: 'IP Transfer Settings' }}
          >
            <FormGroup className="row" name="transfer">
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
                  options={linodesInRegion.map(({ label, id }) => ({ label, value: id }))}
                />
              </div>
            </FormGroup>
            <FormGroup className="row" name="IPs">
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

IPTransferPage.propTypes = {
  linodes: PropTypes.object.isRequired,
  linode: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

function mapStateToProps(state, props) {
  const { linode } = selectLinode(state, props);
  const { linodes } = state.api.linodes;
  return { linode, linodes };
}

export default compose(
  connect(mapStateToProps),
)(IPTransferPage);
