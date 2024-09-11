import * as React from 'react';
import { ui } from 'support/ui';
import { checkComponentA11y } from 'support/util/accessibility';
import { componentTests, visualTests } from 'support/util/components';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

import type { ConfirmationDialogProps } from 'src/components/ConfirmationDialog/ConfirmationDialog';

const confirmationDialogDefaultProps: ConfirmationDialogProps = {
  actions: (
    <ActionsPanel
      primaryButtonProps={{
        label: 'Submit',
        loading: false,
        onClick: () => {},
      }}
      secondaryButtonProps={{
        label: 'Cancel',
        onClick: () => {},
      }}
    />
  ),
  error: undefined,
  onClose: () => {},
  open: false,
  title: 'Confirmation Dialog',
};

type ConfirmationDialogTestUIProps = ConfirmationDialogProps;

const ConfirmationDialogTestUI = (
  confirmationDialogDefaultProps: ConfirmationDialogTestUIProps
) => {
  const { onClose, open } = confirmationDialogDefaultProps;
  const [isOpen, setIsOpen] = React.useState(open);

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Confirmation Dialog</Button>
      <ConfirmationDialog
        {...confirmationDialogDefaultProps}
        onClose={handleClose}
        open={isOpen}
      />
    </>
  );
};

componentTests('ConfirmationDialog', (mount) => {
  describe('Interactions', () => {
    describe('Open ConfirmationDialog', () => {
      /*
       * - ConfirmationDialog can be opened by clicking a CTA button.
       * - ConfirmationDialog renders title, close button, and action panel.
       */
      it('opens the modal via CTA and renders title, close button, and action panel ', () => {
        mount(<ConfirmationDialogTestUI {...confirmationDialogDefaultProps} />);

        ui.button
          .findByTitle('Open Confirmation Dialog')
          .should('exist')
          .click();

        ui.dialog
          .findByTitle('Confirmation Dialog')
          .should('be.visible')
          .within(() => {
            ui.button
              .findByAttribute('aria-label', 'Close')
              .should('be.visible');
            ui.button.findByTitle('Submit').should('be.visible');
            ui.button.findByTitle('Cancel').should('be.visible');
          });
      });

      describe.only('Close ConfirmationDialog', () => {
        /*
         * - Region selection drop-down can be dismissed by pressing the ESC key.
         */
        it.only('can close dialog with ESC key', () => {
          mount(
            <ConfirmationDialogTestUI {...confirmationDialogDefaultProps} />
          );

          ui.button
            .findByTitle('Open Confirmation Dialog')
            .should('exist')
            .click();
          ui.dialog.findByTitle('Confirmation Dialog').should('be.visible');

          cy.get('body').type('{esc}');

          ui.dialog.findByTitle('Confirmation Dialog').should('not.exist');
        });

        it("won't close the dialog by clicking away", () => {
          mount(
            <ConfirmationDialogTestUI {...confirmationDialogDefaultProps} />
          );

          // ui.button
          //   .findByAttribute('title', 'Open')
          //   .should('be.visible')
          //   .should('be.enabled')
          //   .click();

          // ui.autocompletePopper
          //   .findByTitle(`${region.label} (${region.id})`)
          //   .should('be.visible');

          // cy.get('#other-element').click();
          // cy.get('[data-qa-autocomplete-popper]').should('not.exist');
        });
      });
    }),
      describe('Logic', () => {});

    visualTests((mount) => {
      describe('Accessibility checks', () => {
        it('passes aXe check when open', () => {
          mount(
            <ConfirmationDialogTestUI {...confirmationDialogDefaultProps} />
          );
          checkComponentA11y();
        });
      });
    });
  });
});
