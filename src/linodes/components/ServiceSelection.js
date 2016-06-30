import React, { Component, PropTypes } from 'react';

export default class ServiceSelection extends Component {
  constructor() {
    super();
    this.renderPlan = this.renderPlan.bind(this);
  }

  renderHeader() {
    return (
      <header>
        <h2>Select a plan</h2>
      </header>
    );
  }

  renderPlan(plan) {
    const {
      label,
      transfer,
      disk,
      monthly_price: monthlyPrice,
      hourly_price: hourlyPrice,
      ram,
      vcpus,
      id,
    } = plan;
    const { selected, onServiceSelected } = this.props;
    const planClass = id === selected ? 'selected' : '';

    return (
      <div
        className={`plan ${planClass}`}
        key={label}
        onClick={() => onServiceSelected(plan)}
      >
        <header>
          <div className="title">{label}</div>
        </header>
        <div className="plan-contents">
          <div className="pricing">${hourlyPrice / 100}/hr (${monthlyPrice / 100}/mo)</div>
          <hr />
          <div className="cpu-ram">{ram} GB / {vcpus} CPU</div>
          <div className="hdd">{disk} GB SSD</div>
          <div className="transfer">{transfer / 1000} TB Transfer</div>
        </div>
      </div>
    );
  }

  render() {
    const { services } = this.props;
    const sortedPlans = Object.values(services).filter(
      s => s.service_type === 'linode').sort(
        (a, b) => a.ram > b.ram);
    return (
      <div>
        {this.renderHeader()}
        <div className="plans">
          {sortedPlans.map(this.renderPlan)}
        </div>
      </div>
    );
  }
}

ServiceSelection.propTypes = {
  selected: PropTypes.string,
  onServiceSelected: PropTypes.func,
  services: PropTypes.object,
};
