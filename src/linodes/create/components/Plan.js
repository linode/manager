import React, { Component, PropTypes } from 'react';
import { renderPlanStyle } from '~/linodes/components/Linode';

function renderHeader() {
  return (
    <header>
      <h2>Plan</h2>
    </header>
  );
}

export default class Plan extends Component {
  constructor() {
    super();
    this.renderPlan = this.renderPlan.bind(this);
    this.renderPlanStyle = renderPlanStyle.bind(this);
  }

  renderPlan(plan) {
    const monthlyPrice = plan.monthly_price;
    const hourlyPrice = plan.hourly_price;
    const { selected, onServiceSelected } = this.props;
    const planClass = plan.id === selected ? 'selected' : '';

    return (
      <div // eslint-disable-line jsx-a11y/no-static-element-interactions
        className={`plan ${planClass}`}
        key={plan.label}
        onClick={() => onServiceSelected(plan.id)}
      >
        <header>
          <div className="title">{this.renderPlanStyle(plan)}</div>
        </header>
        <div className="plan-contents">
          <div className="pricing">${hourlyPrice / 100}/hr (${monthlyPrice / 100}/mo)</div>
          <hr />
          <div className="cpu-ram">{plan.ram} GB / {plan.vcpus} CPU</div>
          <div className="hdd">{plan.disk} GB SSD</div>
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
        {renderHeader()}
        <div className="plans">
          {sortedPlans.map(this.renderPlan)}
        </div>
      </div>
    );
  }
}

Plan.propTypes = {
  selected: PropTypes.string,
  onServiceSelected: PropTypes.func,
  types: PropTypes.object,
};
