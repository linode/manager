import _ from 'lodash';
import React, { Component, PropTypes } from 'react';

import { Card, CardHeader } from 'linode-components/cards';

import Distributions from '~/linodes/components/Distributions';


export default class Source extends Component {
  render() {
    const { distributions, distribution, onDistroSelected } = this.props;

    return (
      <Card header={<CardHeader title="Source" />}>
        <Distributions
          distributions={distributions}
          distribution={distribution}
          onSelected={onDistroSelected}
        />
      </Card>
    );
  }
}

Source.propTypes = {
  distributions: PropTypes.object.isRequired,
  onDistroSelected: PropTypes.func.isRequired,
  distribution: PropTypes.string.isRequired,
};
