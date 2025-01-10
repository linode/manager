import * as React from 'react';
import { ui } from 'support/ui';
import { checkComponentA11y } from 'support/util/accessibility';
import { createSpy } from 'support/util/components';
import { componentTests, visualTests } from 'support/util/components';

import PasswordInput from 'src/components/PasswordInput/PasswordInput';

componentTests('PasswordInput', (mount) => {
  describe('PasswordInput interactions', () => {});

  visualTests((mount) => {
    describe('Accessibility checks', () => {
      it('passes aXe check when password input is visible', () => {});

      it('passes aXe check when password input is not visible', () => {});
    });
  });
});
