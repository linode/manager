import { Box, Select, Typography } from '@linode/ui';
import * as React from 'react';
import { ui } from 'support/ui';
import { createSpy } from 'support/util/components';
import { componentTests } from 'support/util/components';

import type { SelectOption, SelectProps } from '@linode/ui';

const options = [
  { label: 'Option 1', value: 'option-1' },
  { label: 'Option 2', value: 'option-2' },
  { label: 'Option 3', value: 'option-3' },
];

const openAutocompletePopper = () => {
  ui.button
    .findByAttribute('title', 'Open')
    .should('be.visible')
    .should('be.enabled')
    .click();
};

componentTests('Select', (mount) => {
  describe('Basics', () => {
    describe('Open menu', () => {
      it('can open drop-down menu by clicking drop-down arrow', () => {
        mount(<Select {...defaultProps} />);

        openAutocompletePopper();

        ui.autocompletePopper
          .find()
          .should('be.visible')
          .within(() => {
            cy.get('li').should('have.length', options.length);
          });

        options.forEach((option) => {
          ui.autocompletePopper
            .findByTitle(`${option.label}`)
            .should('be.visible');
        });
      });

      it('should show a "No options found" message when no options are found', () => {
        mount(<Select {...defaultProps} options={[]} />);

        openAutocompletePopper();

        ui.autocompletePopper
          .find()
          .should('be.visible')
          .within(() => {
            cy.contains('No options available').should('be.visible');
          });
      });

      it('can close menu with ESC key', () => {
        mount(<Select {...defaultProps} />);

        openAutocompletePopper();

        ui.autocompletePopper
          .findByTitle(`${options[0].label}`)
          .should('be.visible');

        cy.get('body').type('{esc}');
        cy.get('[data-qa-autocomplete-popper]').should('not.exist');
      });

      it('can close autocomplete popper by clicking away', () => {
        mount(
          <>
            <span id="other-element">Other Element</span>
            <Select {...defaultProps} />
          </>
        );

        openAutocompletePopper();

        ui.autocompletePopper
          .findByTitle(`${options[0].label}`)
          .should('be.visible');

        cy.get('#other-element').click();
        cy.get('[data-qa-autocomplete-popper]').should('not.exist');
      });
    });

    describe('Selection', () => {
      it('can select an option initially', () => {
        mount(<Select {...defaultProps} />);

        openAutocompletePopper();

        ui.autocompletePopper
          .findByTitle(`${options[0].label}`)
          .should('be.visible')
          .click();

        cy.get('input').should('have.attr', 'value', `${options[0].label}`);
        cy.get('[data-qa-autocomplete-popper]').should('not.exist');

        openAutocompletePopper();

        ui.autocompletePopper
          .find()
          .should('be.visible')
          .within(() => {
            cy.get('li').should('have.length', options.length);
            cy.contains(`${options[0].label}`)
              .should('be.visible')
              .should('have.attr', 'aria-selected', 'true');
          });
      });

      it('can select an option by typing', () => {
        mount(<Select {...defaultProps} searchable />);

        cy.get('input').should('have.attr', 'placeholder', 'Select an option');
        cy.findByText('My Select').should('be.visible').click();
        cy.focused().type(options[0].label[0]);

        ui.autocompletePopper
          .findByTitle(`${options[0].label}`)
          .should('be.visible')
          .click();

        cy.get('input').should('have.attr', 'value', `${options[0].label}`);
        cy.get('[data-qa-autocomplete-popper]').should('not.exist');
      });

      it('can change region selection', () => {
        mount(
          <Select
            {...defaultProps}
            value={{
              label: options[0].label,
              value: options[0].value,
            }}
          />
        );

        openAutocompletePopper();

        ui.autocompletePopper
          .findByTitle(`${options[1].label}`)
          .scrollIntoView()
          .should('be.visible')
          .click();

        cy.get('input').should('have.attr', 'value', `${options[1].label}`);

        cy.get('[data-qa-autocomplete-popper]').should('not.exist');
      });

      it('can clear region selection', () => {
        mount(
          <Select
            {...defaultProps}
            value={{
              label: options[1].label,
              value: options[1].value,
            }}
            clearable
          />
        );

        cy.get('input').should('have.attr', 'value', `${options[1].label}`);

        cy.findByLabelText('Clear')
          .should('be.visible')
          .should('be.enabled')
          .click();

        cy.get('input').should('have.attr', 'value', '');
        cy.get('input').should('have.attr', 'placeholder', 'Select an option');
      });

      it('cannot clear region selection when clearable is disabled', () => {
        mount(
          <Select
            {...defaultProps}
            value={{
              label: options[1].label,
              value: options[1].value,
            }}
            clearable={false}
          />
        );

        cy.get('input').should('have.attr', 'value', `${options[1].label}`);
        cy.findByLabelText('Clear').should('not.exist');
      });

      it('cannot clear region selection when no region is selected', () => {
        mount(<Select {...defaultProps} />);

        cy.get('input').should('have.attr', 'value', '');
        cy.get('input').should('have.attr', 'placeholder', 'Select an option');

        cy.findByLabelText('Clear').should('not.exist');
      });

      it('calls `onChange` callback when region is initially selected', () => {
        const spyFn = createSpy(() => {}, 'changeSpy');
        mount(<Select {...defaultProps} onChange={spyFn} />);

        openAutocompletePopper();

        ui.autocompletePopper
          .findByTitle(`${options[1].label}`)
          .should('be.visible')
          .click();

        cy.get('@changeSpy').should('have.been.calledOnce');
      });

      it('calls `onChange` callback when region is cleared (if clearable is true)', () => {
        const spyFn = createSpy(() => {}, 'changeSpy');
        mount(
          <Select
            {...defaultProps}
            value={{
              label: options[1].label,
              value: options[1].value,
            }}
            clearable
            onChange={spyFn}
          />
        );

        cy.findByLabelText('Clear')
          .should('be.visible')
          .should('be.enabled')
          .click();

        cy.get('@changeSpy').should('have.been.calledOnce');
      });
    });
  });

  describe('Creatable', () => {
    it('can create a new option', () => {
      mount(<Select {...defaultProps} creatable />);
      const newOption = 'New Option';

      cy.get('input').should('have.attr', 'placeholder', 'Select an option');
      cy.findByText('My Select').should('be.visible').click();
      cy.focused().type(newOption);

      ui.autocompletePopper
        .find()
        .within(() => {
          cy.contains(`Create "${newOption}"`).should('be.visible');
        })
        .click();

      cy.get('input').should('have.attr', 'value', newOption);
    });
  });

  const defaultProps = {
    label: 'My Select',
    onChange: () => {},
    options,
    placeholder: 'Select an option',
  };

  describe('Logic', () => {
    const WrappedSelect = (props: Partial<SelectProps<SelectOption>>) => {
      const [value, setValue] = React.useState<SelectOption | null | undefined>(
        null
      );

      return (
        <>
          <Select
            {...defaultProps}
            onChange={(_, newValue) =>
              setValue({
                label: newValue?.label ?? '',
                value:
                  newValue?.value.toString().replace(' ', '-').toLowerCase() ??
                  '',
              })
            }
            textFieldProps={{
              onChange: (e) =>
                setValue({
                  label: e.target.value,
                  value: e.target.value.replace(' ', '-').toLowerCase(),
                }),
            }}
            value={value}
            {...props}
          />
          <Box sx={{ mt: 2 }}>
            <Typography data-qa-selected-value>
              {JSON.stringify(value)}
            </Typography>
          </Box>
        </>
      );
    };

    it('renders the value for an existing option', () => {
      mount(<WrappedSelect />);

      cy.get('[data-qa-selected-value]').should('have.text', 'null');

      options.forEach((option) => {
        openAutocompletePopper();
        ui.autocompletePopper
          .findByTitle(`${option.label}`)
          .should('be.visible')
          .click();

        cy.get('[data-qa-selected-value]').should(
          'have.text',
          `{"label":"${option.label}","value":"${option.value}"}`
        );
      });
    });

    it('renders the value for a new option', () => {
      mount(<WrappedSelect creatable />);
      const newOption = 'New Option';

      cy.get('[data-qa-selected-value]').should('have.text', 'null');

      openAutocompletePopper();
      cy.focused().type(newOption);

      ui.autocompletePopper
        .find()
        .within(() => {
          cy.contains(`Create "${newOption}"`).should('be.visible');
        })
        .click();

      cy.get('[data-qa-selected-value]').should(
        'have.text',
        `{"label":"${newOption}","value":"${newOption
          .replace(' ', '-')
          .toLowerCase()}"}`
      );
    });
  });
});
