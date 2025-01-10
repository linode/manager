import * as React from 'react';
import { checkComponentA11y } from 'support/util/accessibility';
import { componentTests, visualTests } from 'support/util/components';

import PasswordInput from 'src/components/PasswordInput/PasswordInput';

const fakePassword = 'this is a password';
const props = {
  label: 'Password Input',
  value: fakePassword,
};

componentTests('PasswordInput', (mount) => {
  describe('PasswordInput interactions', () => {
    /**
     * - Confirms password text starts hidden
     * - Confirms password text can be shown after clicking eye button
     */
    it('can show password text', () => {
      mount(<PasswordInput {...props} />);

      // Password textfield starts off as 'password' type
      cy.get('[type="password"]').should('be.visible');
      cy.findByTestId('VisibilityIcon').should('be.visible').click();
      cy.findByTestId('VisibilityIcon').should('not.exist');

      // After clicking the visibility icon, textfield becomes a normal textfield
      cy.get('[type="password"]').should('not.exist');
      cy.get('[type="text"]').should('be.visible');
    });

    /**
     * - Confirms password text can be hidden again after being revealed
     */
    it('can hide password text', () => {
      mount(<PasswordInput {...props} />);

      // Password textfield starts off as 'password' type
      cy.get('[type="password"]').should('be.visible');
      cy.findByTestId('VisibilityIcon').should('be.visible').click();
      cy.findByTestId('VisibilityIcon').should('not.exist');

      // After clicking the visibility icon, textfield becomes a normal textfield
      cy.get('[type="password"]').should('not.exist');
      cy.get('[type="text"]').should('be.visible');

      // Clicking VisibilityOffIcon changes input type to password again
      cy.findByTestId('VisibilityOffIcon').should('be.visible').click();
      cy.findByTestId('VisibilityOffIcon').should('not.exist');
      cy.findByTestId('VisibilityIcon').should('be.visible');
      cy.get('[type="password"]').should('be.visible');
      cy.get('[type="text"]').should('not.exist');
    });

    /**
     * - Confirms password input displays when a weak password is entered
     */
    it('displays an indicator for a weak password', () => {
      const TestWeakStrength = () => {
        const [password, setPassword] = React.useState('');
        return (
          <PasswordInput
            {...props}
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
        );
      };

      mount(<TestWeakStrength />);

      // Starts off as 'Weak' if no password entered
      cy.findByText('Weak').should('be.visible');

      cy.findByTestId('textfield-input').should('be.visible').type('weak');
      cy.findByText('Weak').should('be.visible');
    });

    /**
     * - Confirms password input displays when a fair password is entered
     */
    it('displays an indicator for a fair password', () => {
      const TestMediumStrength = () => {
        const [password, setPassword] = React.useState('');
        return (
          <PasswordInput
            {...props}
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
        );
      };

      mount(<TestMediumStrength />);

      // Starts off as 'Weak' if no password entered
      cy.findByText('Weak').should('be.visible');

      cy.findByTestId('textfield-input')
        .should('be.visible')
        .type('fair-pass1');
      cy.findByText('Fair').should('be.visible');
    });

    /**
     * - Confirms password input displays when a good password is entered
     */
    it('displays an indicator for a "good" password', () => {
      const TestGoodStrength = () => {
        const [password, setPassword] = React.useState('');
        return (
          <PasswordInput
            {...props}
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
        );
      };

      mount(<TestGoodStrength />);

      // Starts off as 'Weak' if no password entered
      cy.findByText('Weak').should('be.visible');

      cy.findByTestId('textfield-input')
        .should('be.visible')
        .type('st0ng!!-password1!!');
      cy.findByText('Good').should('be.visible');
    });
  });

  visualTests((mount) => {
    describe('Accessibility checks', () => {
      it('passes aXe check when password input is visible', () => {
        mount(<PasswordInput {...props} />);
        cy.findByTestId('VisibilityIcon').should('be.visible').click();

        checkComponentA11y();
      });

      it('passes aXe check when password input is not visible', () => {
        mount(<PasswordInput {...props} />);

        checkComponentA11y();
      });

      it('passes aXe check for a weak password', () => {
        mount(<PasswordInput {...props} value="" />);

        checkComponentA11y();
      });

      it('passes aXe check for a fair password', () => {
        mount(<PasswordInput {...props} value="fair-pass1" />);

        checkComponentA11y();
      });

      it('passes aXe check for a "good" password', () => {
        mount(<PasswordInput {...props} value="st0ng!!-password1!!" />);

        checkComponentA11y();
      });

      it('passes aXe check when password input is designated as required', () => {
        mount(<PasswordInput {...props} required />);

        checkComponentA11y();
      });

      it('passes aXe check when strength value is hidden', () => {
        mount(<PasswordInput {...props} hideValidation />);

        checkComponentA11y();
      });

      it('passes aXe check when strength label is shown', () => {
        mount(<PasswordInput {...props} hideStrengthLabel={false} />);

        checkComponentA11y();
      });
    });
  });
});
