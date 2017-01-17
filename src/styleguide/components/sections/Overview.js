import React from 'react';

import { StyleguideSection } from '~/styleguide/components';

export default function Overview() {
  return (
    <StyleguideSection name="overview" title="Overview">
      <div className="col-sm-12">
        <div className="StyleguideSubSection row">
          <div className="col-sm-10">
            <p>
              At Linode, we want to create a consistent user experience.
              This document describes the shared components and patterns
              used to achieve a consistent experience custom to Linode.
            </p>
            <p>
              The goals of the Style Guide include:
            </p>
            <ul>
              <li>Code reuse through shared, atomic components</li>
              <li>
                Consistent building, allowing effort to be focused
                on application logic and user flow
              </li>
              <li>
                Documenting common patterns in a single place,
                supporting fast iterations, and easy maintenance
              </li>
            </ul>
            <p>
              Documented patterns are flexible, and are intended
              to be adapted to solve unique challenges.
            </p>
          </div>
        </div>
      </div>
    </StyleguideSection>
  );
}
