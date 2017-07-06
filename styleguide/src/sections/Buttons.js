import React from 'react';

import { StyleguideSection } from '../components';
import { Button, LinkButton, PrimaryButton, SecondaryButton } from 'linode-components/buttons';
import { Dropdown } from 'linode-components/dropdowns';

export default function Buttons() {
  return (
    <StyleguideSection name="buttons" title="Buttons">
      <div className="StyleguideButtons col-sm-12">
        <div className="Styleguide-sub-section row">
          <div className="col-sm-12">
            <h3>Button</h3>
            <p>
              Example: <Button>Button</Button>
            </p>
            <p>
              This is the default button style, appropriate for most
              situations.
            </p>
            <br />

            <h3>LinkButton</h3>
            <p>
              Example: <LinkButton>LinkButton</LinkButton>
            </p>
            <p>
              This button is meant to look like any regular link. It renders a
              react-router Link if it has a to property provided, or a button
              tag if only onClick is specified.
            </p>
            <br />

            <h3>PrimaryButton</h3>
            <p>
              Example: <PrimaryButton>PrimaryButton</PrimaryButton>
            </p>
            <p>
              This is for focal points and calls to action. Use sparingly.
            </p>
            <br />

            <h3>SecondaryButton</h3>
            <p>
              Example: <SecondaryButton>Secondary Button</SecondaryButton>
            </p>
            <p>
              Use secondary buttons for non-primary actions, edit, delete, cancel, etc.
            </p>
            <br />

            <h3>Dropdown</h3>
            <p>
              Example:
              <Dropdown groups={[ { elements: [{ name: 'test' }] } ]} />
            </p>
            <p>
              This dropdown is for links and actions outside of forms.
            </p>
          </div>
        </div>
      </div>
    </StyleguideSection>
  );
}
