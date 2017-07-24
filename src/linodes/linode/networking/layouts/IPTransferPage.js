import _ from 'lodash';
import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

import { Card, CardHeader } from 'linode-components/cards';
import {
  Form,
  FormGroup,
  FormSummary,
  SubmitButton,
  Select,
} from 'linode-components/forms';

import { setSource } from '~/actions/source';
import { linodes } from '~/api';
import { ipv4s, assignIPs } from '~/api/networking';
import {
  createHeaderFilter,
  dispatchOrStoreErrors,
  getObjectByLabelLazily,
} from '~/api/util';

import { IPList } from '../components';
import { selectLinode } from '../../utilities';


export class IPTransferPage extends Component {
  static async preload({ dispatch, getState }, { linodeLabel }) {
    const { region } = await dispatch(getObjectByLabelLazily('linodes', linodeLabel));

    await Promise.all([
      ipv4s(region),
      linodes.all([], undefined, createHeaderFilter({ region: region.id })),
    ].map(dispatch));
  }

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
      () => assignIPs(linode.region.id, assignments),
      // This setState is important so that old checked IPs that have transferred don't break
      // things.
      () => this.setState({ checkedA: {}, checkedB: {} }),
    ]));
  }

  otherLinodes() {
    const { linodes, linode } = this.props;
    return Object.values(_.pickBy(linodes, l => l.region.id === linode.region.id))
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
                  options={linodesInRegion.map(linode => ({ ...linode, value: linode.id }))}
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

IPTransferPage.propTypes = {
  linodes: PropTypes.object.isRequired,
  linode: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

function select(state, props) {
  const { linode } = selectLinode(state, props);
  const { linodes } = state.api.linodes;
  return { linode, linodes };
}

export default connect(select)(IPTransferPage);
