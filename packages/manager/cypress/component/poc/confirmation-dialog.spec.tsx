import * as React from 'react';
import { ui } from 'support/ui';
import { checkComponentA11y } from 'support/util/accessibility';
import { componentTests, visualTests } from 'support/util/components';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

import type { ConfirmationDialogProps } from 'src/components/ConfirmationDialog/ConfirmationDialog';

type ConfirmationDialogTestUIProps = ConfirmationDialogProps;

const ConfirmationDialogTestUI = (
  confirmationDialogDefaultProps: Partial<ConfirmationDialogTestUIProps>
) => {
  const { onClose, onSubmit, open } = confirmationDialogDefaultProps;
  const [isOpen, setIsOpen] = React.useState(open);
  const [submitted, setSubmitted] = React.useState(false);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const handleSubmit = (
    e: React.FormEvent<HTMLDivElement> | React.MouseEvent<HTMLButtonElement>
  ) => {
    setIsOpen(false);
    setSubmitted(true);
    onSubmit?.(e as React.FormEvent<HTMLDivElement>);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Confirmation Dialog</Button>
      <ConfirmationDialog
        {...confirmationDialogDefaultProps}
        actions={
          <ActionsPanel
            primaryButtonProps={{
              label: 'Submit',
              onClick: handleSubmit,
            }}
            secondaryButtonProps={{
              label: 'Cancel',
              onClick: handleClose,
            }}
          />
        }
        onClose={handleClose}
        onSubmit={handleSubmit}
        open={isOpen ?? false}
        title="Confirmation Dialog"
      />
      {submitted && <div data-qa-submitted>Submitted</div>}
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
        mount(<ConfirmationDialogTestUI />);

        ui.button.findByTitle('Open Confirmation Dialog').click();

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
    });

    describe('Close ConfirmationDialog', () => {
      /*
       * - Region selection drop-down can be dismissed by pressing the ESC key.
       */
      it('can close dialog with ESC key', () => {
        mount(<ConfirmationDialogTestUI />);

        ui.button.findByTitle('Open Confirmation Dialog').click();
        ui.dialog.findByTitle('Confirmation Dialog').should('be.visible');

        cy.get('body').type('{esc}');
        cy.get('[data-qa-dialog]').should('not.exist');
      });

      /**
       * - ConfirmationDialog can be closed by clicking the close button.
       */
      it('can close dialog with dialog close button', () => {
        mount(<ConfirmationDialogTestUI />);

        ui.button.findByTitle('Open Confirmation Dialog').click();

        ui.dialog
          .findByTitle('Confirmation Dialog')
          .should('be.visible')
          .within(() => {
            ui.button.findByAttribute('aria-label', 'Close').click();
          });

        cy.get('[data-qa-dialog]').should('not.exist');
      });

      /**
       * - ConfirmationDialog can be closed by clicking the "Cancel" button.
       */
      it('can close dialog with "Cancel" button', () => {
        mount(<ConfirmationDialogTestUI />);

        ui.button.findByTitle('Open Confirmation Dialog').click();

        ui.dialog
          .findByTitle('Confirmation Dialog')
          .should('be.visible')
          .within(() => {
            ui.button.findByTitle('Cancel').click();
          });

        cy.get('[data-qa-dialog]').should('not.exist');
      });

      /**
       * - ConfirmationDialog won't close by clicking outside the dialog.
       */
      it("won't close the dialog by clicking outside", () => {
        mount(<ConfirmationDialogTestUI />);

        ui.button.findByTitle('Open Confirmation Dialog').click();

        cy.get('body').click();
        cy.get('[data-qa-dialog]').should('be.visible');
      });
    });

    describe('Submit ConfirmationDialog', () => {
      /**
       * - ConfirmationDialog can be submitted by clicking the "Submit" button.
       */
      it('can submit dialog with "Submit" button', () => {
        mount(<ConfirmationDialogTestUI />);

        ui.button.findByTitle('Open Confirmation Dialog').click();

        ui.dialog
          .findByTitle('Confirmation Dialog')
          .should('be.visible')
          .within(() => {
            ui.button.findByTitle('Submit').click();
          });

        cy.get('[data-qa-dialog]').should('not.exist');
        cy.get('[data-qa-submitted]').should('be.visible');
      });

      /**
       * - ConfirmationDialog can be submitted by pressing the Enter key.
       */
      it('can submit dialog with Enter key', () => {
        mount(<ConfirmationDialogTestUI />);

        ui.button.findByTitle('Open Confirmation Dialog').click();

        ui.dialog
          .findByTitle('Confirmation Dialog')
          .should('be.visible')
          .within(() => {
            cy.get('.MuiDialog-container').type('{enter}');
          });

        cy.get('[data-qa-dialog]').should('not.exist');
        cy.get('[data-qa-submitted]').should('be.visible');
      });

      /**
       * - Pressing the Enter key while being active on a textfield within the dialog does not submit the dialog.
       */
      it('pressing enter key while being active on a textfield within the dialog does not submit the dialog', () => {
        mount(
          <ConfirmationDialogTestUI>
            <input data-qa-input placeholder="Edit me!" type="text" />
          </ConfirmationDialogTestUI>
        );

        ui.button.findByTitle('Open Confirmation Dialog').click();

        ui.dialog
          .findByTitle('Confirmation Dialog')
          .should('be.visible')
          .within(() => {
            cy.get('[data-qa-input]').type("I won't submit the form!{enter}");
          });

        cy.get('[data-qa-dialog]').should('be.visible');
        cy.get('[data-qa-submitted]').should('not.exist');
      });

      /**
       * - Pressing the Enter key while being active on an autocomplete within the dialog does not submit the dialog.
       */
      it('pressing enter key while being active on an autocomplete within the dialog does not submit the dialog', () => {
        mount(
          <ConfirmationDialogTestUI>
            <Autocomplete
              options={[
                { label: 'Option 1' },
                { label: 'Option 2' },
                { label: 'Option 3' },
              ]}
              label="Choose a value"
            />
          </ConfirmationDialogTestUI>
        );

        ui.button.findByTitle('Open Confirmation Dialog').click();

        ui.dialog
          .findByTitle('Confirmation Dialog')
          .should('be.visible')
          .within(() => {
            cy.get('[data-qa-autocomplete]').type('Option 1');
            cy.get('[data-qa-autocomplete]').type('{enter}');
          });

        cy.get('[data-qa-dialog]').should('be.visible');
        cy.get('[data-qa-submitted]').should('not.exist');
      });
    });
  });

  describe('Error display', () => {
    /**
     * - ConfirmationDialog displays error message when error prop is passed.
     */
    it('displays error message when error prop is passed', () => {
      mount(<ConfirmationDialogTestUI error="Error message" />);

      ui.button.findByTitle('Open Confirmation Dialog').click();

      ui.dialog
        .findByTitle('Confirmation Dialog')
        .should('be.visible')
        .within(() => {
          cy.get('[data-qa-dialog-content]').should('be.visible');
          cy.get('[data-qa-dialog-content]').should('contain', 'Error message');
        });
    });
  });

  /**
   * - ConfirmationDialog passes aXe check when open.
   */
  visualTests((mount) => {
    describe('Accessibility checks', () => {
      it('passes aXe check when open', () => {
        mount(<ConfirmationDialogTestUI />);
        checkComponentA11y();
      });
    });
  });
});
