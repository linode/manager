import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Card from 'linode-components/dist/cards/Card';
import CardHeader from 'linode-components/dist/cards/CardHeader';
import ExternalLink from 'linode-components/dist/buttons/ExternalLink';
import LinkButton from 'linode-components/dist/buttons/LinkButton';

export default class TicketHelper extends Component {
  constructor() {
    super();

    this.state = {
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

  toggleSection(section) {
    return () =>
      this.setState({ hidden: { ...this.state.hidden, [section]: !this.state.hidden[section] } });
  }


  render() {
    const header = !this.props.displayHeader ? null : (
      <CardHeader title={'We love your tickets and we love helping our customers'} />
    );
    const note = !this.props.displayHeader ? null : (
      // eslint-disable max-len
      <p>However, please keep in mind that not all topics are within the scope of our support.</p>
      // eslint-enable max-len
    );

    return (
      <Card
        header={header}
        className="TicketHelper"
      >
        {note}
        <h3 className="sub-header">Frequently Asked Questions</h3>
        <ul className="list-unstyled">
          <li>
            <LinkButton onClick={this.toggleSection('availibility')} id="availibility-button">
              When will there be availibility in Tokyo, Singapore, or Frankfurt?
            </LinkButton>
            <p className={this.state.hidden.availibility ? 'hidden' : ''} id="availibility"><small>
              {/* eslint-disable max-len */}
              Our Singapore and Frankfurt regions are now available and we are currently considering expansion in Tokyo. You can stay up-to-date on all region news on <ExternalLink to="https://blog.linode.com">our blog</ExternalLink>.
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
              information about our billing system, see the <ExternalLink to="https://www.linode.com/docs/platform/billing-and-payments">billing</ExternalLink> guide.
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
              With Linode, you can slice and dice your storage quota among multiple disks images. This simply means that you have allocated all of your Linode storage space towards disk images. See our <ExternalLink to="https://www.linode.com/docs/migrate-to-linode/disk-images/disk-images-and-configuration-profiles">disk images</ExternalLink> guide for more information.
              {/* eslint-enable max-len */}
            </small></p>
          </li>
        </ul>
        <h3 className="sub-header">Resources</h3>
        <ul className="list-unstyled">
          <li>
            <ExternalLink to="https://www.linode.com/community">Community</ExternalLink>
          </li>
          <li>
            <ExternalLink to="https://www.linode.com/docs/">
              User documentation and guides
            </ExternalLink>
          </li>
          <li>
            <ExternalLink to="https://developers.linode.com/">
              Developer documentation and guides
            </ExternalLink>
          </li>
          <li>
            <ExternalLink to="https://status.linode.com/">
              Overall system status
            </ExternalLink>
          </li>
        </ul>
      </Card>
    );
  }
}

TicketHelper.propTypes = {
  displayHeader: PropTypes.bool,
};
