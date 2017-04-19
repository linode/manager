import React, { Component, PropTypes } from 'react';

import PlanStyle from '~/linodes/components/PlanStyle';

export default class Plan extends Component {
  constructor() {
    super();
    this.renderPlan = this.renderPlan.bind(this);
  }

  renderPlan(plan) {
    const monthlyPrice = plan.monthly_price;
    const hourlyPrice = plan.hourly_price;
    const { selected, onServiceSelected } = this.props;
    const planClass = plan.id === selected ? 'selected' : '';

    return (
      <div
        className={`plan ${planClass}`}
        key={plan.id}
        onClick={() => onServiceSelected(plan.id)}
      >
        <header>
          <div className="title">
            <PlanStyle plan={plan} />
          </div>
        </header>
        <div className="option-contents">
          <div className="pricing">${hourlyPrice / 100}/hr (${monthlyPrice / 100}/mo)</div>
          <hr />
          <div className="cpu-ram">{plan.ram} GB / {plan.vcpus} CPU</div>
          <div className="hdd">{Math.round(plan.storage / 1024)} GB SSD</div>
          <div className="transfer">{plan.transfer / 1000} TB Transfer</div>
        </div>
      </div>
    );
  }

  render() {
    const { types } = this.props;
    const sortedPlans = Object.values(types).sort(
      (a, b) => a.ram > b.ram);
    return (
      <div>
        {sortedPlans.map(this.renderPlan)}
      </div>
    );
  }
}

Plan.propTypes = {
  selected: PropTypes.string,
  onServiceSelected: PropTypes.func,
  types: PropTypes.object,
};
