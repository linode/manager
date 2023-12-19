import React from 'react';

import { routeFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { RuleDrawer } from './RuleDrawer';

const props = {
  loadbalancerId: 1,
  onClose: vi.fn(),
  open: true,
  route: routeFactory.build({
    protocol: 'http',
    rules: [
      {
        match_condition: {
          hostname: 'www.acme.com',
          match_field: 'path_prefix',
          match_value: '/A/*',
          session_stickiness_cookie: 'my-cookie',
          session_stickiness_ttl: 8,
        },
        service_targets: [
          {
            id: 1,
            label: 'my-service-target',
            percentage: 100,
          },
        ],
      },
    ],
  }),
};

describe('RuleDrawer', () => {
  it('should be in create mode when no rule index is passed', () => {
    const { getByText } = renderWithTheme(
      <RuleDrawer {...props} ruleIndexToEdit={undefined} />
    );

    expect(getByText('Add Rule', { selector: 'h2' })).toBeVisible();
  });
  it('should be in edit mode when a serviceTarget is passed', () => {
    const { getByText } = renderWithTheme(
      <RuleDrawer {...props} ruleIndexToEdit={0} />
    );

    expect(getByText('Edit Rule')).toBeVisible();
  });
  it('should populate fields if we are editing', () => {
    const { getByLabelText } = renderWithTheme(
      <RuleDrawer {...props} ruleIndexToEdit={0} />
    );

    const hostnameField = getByLabelText('Hostname (optional)');
    expect(hostnameField).toHaveDisplayValue(
      props.route.rules[0].match_condition.hostname!
    );

    const matchTypeField = getByLabelText('Match Type');
    expect(matchTypeField).toHaveDisplayValue('Path');

    const matchValueField = getByLabelText('Match Value');
    expect(matchValueField).toHaveDisplayValue(
      props.route.rules[0].match_condition.match_value
    );

    const cookieField = getByLabelText('Cookie Key');
    expect(cookieField).toHaveDisplayValue(
      props.route.rules[0].match_condition.session_stickiness_cookie!
    );

    const ttlField = getByLabelText('Stickiness TTL');
    expect(ttlField).toHaveDisplayValue(
      String(props.route.rules[0].match_condition.session_stickiness_ttl)
    );
  });
});
