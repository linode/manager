import React, { PropTypes } from 'react';

import { Card, CardHeader } from 'linode-components/cards';

import Distributions from '~/linodes/components/Distributions';


export default function Source(props) {
  const { distributions, distribution, onDistroSelected } = props;

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

Source.propTypes = {
  distributions: PropTypes.object.isRequired,
  onDistroSelected: PropTypes.func.isRequired,
  distribution: PropTypes.string.isRequired,
};
