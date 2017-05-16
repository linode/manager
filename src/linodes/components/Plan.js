import _ from 'lodash';
import React, { Component, PropTypes } from 'react';

import PlanStyle from '~/linodes/components/PlanStyle';

export default class Plan extends Component {
  constructor() {
    super();
    this.renderPlan = this.renderPlan.bind(this);
  }

  renderClass(plans, group, label) {
    const planGroup = Object.values(plans).filter(
      plan => {
        if (group.indexOf(plan.class) > -1) {
          return plan;
        }
      }
    );

    const chunkedPlans = _.chunk(planGroup, 4);
    return (
      <div key={label} className="plan-group">
        <h3>{label}</h3>
        <div>
        {chunkedPlans.map((arr, index) => {
          return (
            <div key={index} className="row">
              {arr.map((plan, index) => {
                return (
                  <div key={index} className="col-sm-3">
                    {this.renderPlan(plan)}
                  </div>
                );
              })}
            </div>
          );
        })}
        </div>
      </div>
    );
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
          <div className="pricing">${hourlyPrice}/hr (${monthlyPrice}/mo)</div>
          <hr />
          <div className="cpu-ram">{plan.ram / 1024} GB / {plan.vcpus} CPU</div>
          <div className="hdd">{Math.round(plan.storage / 1024)} GB SSD</div>
          <div className="transfer">{plan.transfer / 1000} TB Transfer</div>
        </div>
      </div>
    );
  }

  sortPlans = (types, key) => types.sort((a,b) => {
    return (a[key] > b[key]) ? 1 : ((b[key] > a[key]) ? -1 : 0);
  });

  render() {
    const { types } = this.props;
    const sortedPlans = this.sortPlans(Object.values(types), 'ram');

    const chunkedPlans = _.chunk(sortedPlans, 4);

    return (
      <div>
        {this.renderClass(sortedPlans, ['standard', 'nanode'], 'Standard')}
        {this.renderClass(sortedPlans, ['highmem'], 'High Memory')}
      </div>
    );
  }
}

Plan.propTypes = {
  selected: PropTypes.string,
  onServiceSelected: PropTypes.func,
  types: PropTypes.object,
};
