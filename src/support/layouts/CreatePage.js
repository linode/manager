import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { Card } from '~/components/cards';
import { Input, Select, Form, FormGroup, FormGroupError, SubmitButton } from '~/components/form';
import { tickets } from '~/api';
import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import { setError } from '~/actions/errors';
import { reduceErrors, ErrorSummary } from '~/errors';
import { LinkButton } from '~/components/buttons';
import { Link } from '~/components/Link';
import { linodes, dnszones, nodebalancers } from '~/api';

export class CreatePage extends Component {
  static async preload({ dispatch }) {
    try {
      await dispatch(linodes.all());
      await dispatch(dnszones.all());
      await dispatch(nodebalancers.all());
    } catch (response) {
      // eslint-disable-next-line no-console
      console.error(response);
      dispatch(setError(response));
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      summary: '',
      regarding: `linode_id:${Object.values(props.linodes)[0].id}`,
      description: '',
      errors: {},
      creating: false,
      hidden: {
        availibility: true,
        gfw: true,
        transfer_linode: true,
        powered_off: true,
        network_transfer: true,
        disk_full: true,
      },
    };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));

    dispatch(setTitle('Open a Ticket'));
  }

  onSubmit = async () => {
    const { dispatch } = this.props;
    const { summary, regarding, description } = this.state;

    const regardingField = regarding.substring(0, regarding.indexOf(':'));
    const regardingId = regarding.substring(regardingField.length + 1);

    this.setState({ loading: true, errors: {} });

    try {
      await dispatch(tickets.post({ summary, description, [regardingField]: +regardingId }));

      // TODO: Redirect to newly create ticket page
      dispatch(push('/support'));
    } catch (response) {
      const errors = await reduceErrors(response);
      this.setState({ errors });
    }

    this.setState({ loading: false });
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  toggleSection(section) {
    return () =>
      this.setState({ hidden: { ...this.state.hidden, [section]: !this.state.hidden[section] } });
  }

  renderOptionsGroup(label, field, group) {
    return (
      <optgroup label={label} key={label}>
        {group.map(object => (
          <option key={object.id} value={`${field}:${object.id}`}>
            {object.label || object.dnszone}
          </option>
         ))}
      </optgroup>
    );
  }

  render() {
    const { summary, regarding, description, creating, errors } = this.state;
    const { linodes, dnszones, nodebalancers } = this.props;
    const regardingOptions = [
      this.renderOptionsGroup('Linodes', 'linode_id', Object.values(linodes)),
      this.renderOptionsGroup('DNS Zones', 'dnszone_id', Object.values(dnszones)),
      this.renderOptionsGroup('NodeBalancers', 'nodebalancer_id', Object.values(nodebalancers)),
      // TODO: this is not currently supported by the API
      // this.renderOptionsGroup('Other', [{ label: 'Other', id: 'other' }]),
    ];

    return (
      <div className="container create-page">
        <header className="text-sm-left">
          <Link to="/support">Support</Link>
          <h1>Open a ticket</h1>
        </header>
        <Card
          title="We love your tickets and we love helping our customers"
          className="TicketHelper"
        >
          {/* eslint-disable max-len */}
          <p>However, please keep in mind that not all topics are within the scope of our support.</p>
          {/* eslint-enable max-len */}
          <div>
            <h3 className="sub-header">Frequently Asked Questions</h3>
            <ul className="list-unstyled">
              <li>
                <LinkButton onClick={this.toggleSection('availibility')}>
                  When will there be availibility in Tokyo, Singapore, or Frankfurt?
                </LinkButton>
                <p className={this.state.hidden.availibility ? 'hidden' : ''}><small>
                  {/* eslint-disable max-len */}
                  Our Singapore and Frankfurt datacenters are now available and we are currently considering expansion in Tokyo. You can stay up-to-date on all datacenter news on <Link to="https://blog.linode.com">our blog</Link>.
                  {/* eslint-enable max-len */}
                </small></p>
              </li>
              <li>
                <LinkButton onClick={this.toggleSection('gfw')}>
                  What do I do if my IP address is blocked by the GFW?
                </LinkButton>
                <p className={this.state.hidden.gfw ? 'hidden' : ''}><small>
                  {/* eslint-disable max-len */}
                  Great Firewall (GFW) - The Chinese government has been actively blocking IP addresses. If your IP address has been blocked by the GFW, please run an MTR report to your Linode from your location as well as the reverse and create a support ticket requesting a new IP address. We will make every effort to accomodate you as best we can.
                  {/* eslint-enable max-len */}
                </small></p>
              </li>
              <li>
                <LinkButton onClick={this.toggleSection('transfer_linode')}>
                  How do I transfer a Linode from one account to another?
                </LinkButton>
                <p className={this.state.hidden.transfer_linode ? 'hidden' : ''}><small>
                  {/* eslint-disable max-len */}
                  To transfer your Linode from one account to the other, we need you to open tickets from both accounts indicating the name of the Linode(s) you want to transfer as well as the name of the accounts you want to transfer them to and from.
                  {/* eslint-enable max-len */}
                </small></p>
              </li>
              <li>
                <LinkButton onClick={this.toggleSection('powered_off')}>
                  Am I charged for powered-off Linodes?
                </LinkButton>
                <p className={this.state.hidden.powered_off ? 'hidden' : ''}><small>
                  {/* eslint-disable max-len */}
                  Yes, your Linode will be charged regardless of whether it is powered on. For more
                  information about our billing system, see the <Link to="https://www.linode.com/docs/platform/billing-and-payments">billing</Link> guide.
                  {/* eslint-enable max-len */}
                </small></p>
              </li>
              <li>
                <LinkButton onClick={this.toggleSection('network_transfer')}>
                  Why is my network transfer pool lower than expected?
                </LinkButton>
                <p className={this.state.hidden.network_transfer ? 'hidden' : ''}><small>
                  {/* eslint-disable max-len */}
                  Linode services are prorated, so you received the prorated amount of transfer from the day you added your Linode until the end of the month. Your transfer quota will reset on the first of next month.
                  {/* eslint-enable max-len */}
                </small></p>
              </li>
              <li>
                <LinkButton onClick={this.toggleSection('disk_full')}>
                  Why does it say I'm using 100% of my disk?
                </LinkButton>
                <p className={this.state.hidden.disk_full ? 'hidden' : ''}><small>
                  {/* eslint-disable max-len */}
                  With Linode, you can slice and dice your storage quota among multiple disks images. This simply means that you have allocated all of your Linode storage space towards disk images. See our <Link to="https://www.linode.com/docs/migrate-to-linode/disk-images/disk-images-and-configuration-profiles">disk images</Link> guide for more information.
                  {/* eslint-enable max-len */}
                </small></p>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="sub-header">Resources</h3>
            <ul className="list-unstyled">
              <li><Link to="https://forum.linode.com/">Community forum</Link></li>
              <li><Link to="https://www.linode.com/docs/">User documentation and guides</Link></li>
              <li><Link to="https://developers.linode.com/">Developer documentation and guides</Link></li>
              <li><Link to="https://status.linode.com/">Overall system status</Link></li>
            </ul>
          </div>
        </Card>
        <Card>
          <Form onSubmit={this.onSubmit}>
            <FormGroup className="row" errors={errors} name="summary">
              <label htmlFor="summary" className="col-sm-2 col-form-label">Summary</label>
              <div className="col-sm-10">
                <Input
                  name="summary"
                  id="summary"
                  value={summary}
                  className="input-lg"
                  onChange={this.onChange}
                />
                <FormGroupError errors={errors} name="summary" inline={false} />
              </div>
            </FormGroup>
            <FormGroup className="row" errors={errors} name="regarding">
              <label htmlFor="regarding" className="col-sm-2 col-form-label">Regarding</label>
              <div className="col-sm-10">
                <Select
                  name="regarding"
                  id="regarding"
                  value={regarding}
                  onChange={this.onChange}
                >{regardingOptions}</Select>
                <FormGroupError errors={errors} name="regarding" inline={false} />
              </div>
            </FormGroup>
            <FormGroup className="row" errors={errors} name="description">
              <label htmlFor="description" className="col-sm-2 col-form-label">
                Description
              </label>
              <div className="col-sm-10">
                <textarea
                  className="textarea-md"
                  name="description"
                  id="description"
                  value={description}
                  onChange={this.onChange}
                />
                <FormGroupError errors={errors} name="description" inline={false} />
              </div>
            </FormGroup>
            <FormGroup className="row">
              <div className="col-sm-10 offset-sm-2">
                <SubmitButton disabled={creating}>Open Ticket</SubmitButton>
              </div>
            </FormGroup>
            <ErrorSummary errors={errors} />
          </Form>
        </Card>
      </div>
    );
  }
}

CreatePage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linodes: PropTypes.object.isRequired,
  dnszones: PropTypes.object.isRequired,
  nodebalancers: PropTypes.object.isRequired,
};

function select(state) {
  return {
    nodebalancers: state.api.nodebalancers.nodebalancers,
    linodes: state.api.linodes.linodes,
    dnszones: state.api.dnszones.dnszones,
  };
}

export default connect(select)(CreatePage);
