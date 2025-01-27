import { imageFactory } from '@src/factories';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { mockGetAllImages } from 'support/intercepts/images';
import { componentTests } from 'support/util/components';
import { apiMatcher } from 'support/util/intercepts';
import { randomLabel, randomNumber } from 'support/util/random';

import { OperatingSystems } from 'src/features/Linodes/LinodeCreate/Tabs/OperatingSystems';

const queryClient = new QueryClient();

const createMockImage = (eol: null | string, deprecated: boolean) => {
  return imageFactory.build({
    deprecated,
    eol,
    id: `public/${randomNumber()}`,
    is_public: true,
    label: randomLabel(),
    status: 'available',
  });
};

const generateDate = (isPast: boolean, days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + (isPast ? -days : days));

  const yyyyMMdd = date.toISOString().split('T')[0];
  const mmddyyyy = `${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${date
    .getDate()
    .toString()
    .padStart(2, '0')}/${date.getFullYear()}`;

  return {
    mmddyyyy,
    yyyyMMdd,
  };
};

const mockImage = createMockImage(null, false);

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const methods = useForm({
    defaultValues: {
      image: null,
      region: null,
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <FormProvider {...methods}>{children}</FormProvider>
    </QueryClientProvider>
  );
};

const getPastDeprecatedWarningMessage = (
  imageName: string,
  eol: null | string
): string => {
  return `${imageName} reached its end-of-life on ${eol}. This OS distribution will no longer receive security updates or technical support. We recommend selecting a newer supported version to ensure continued security and stability for your linodes.`;
};

const getFutureDeprecatedWarningMessage = (
  imageName: string,
  eol: null | string
): string => {
  return `${imageName} will reach its end-of-life on ${eol}. After this date, this OS distribution will no longer receive security updates or technical support. We recommend selecting a newer supported version to ensure continued security and stability for your linodes.`;
};

componentTests('Select', (mount) => {
  describe('Operating System Component', () => {
    it('should display warning for deprecated image has reached eol', () => {
      const pastDate = generateDate(true, 1);
      const mockDeprecatedImage = createMockImage(pastDate.yyyyMMdd, true);
      mockGetAllImages([mockDeprecatedImage]).as('mockImage');
      cy.intercept('GET', apiMatcher('/images/*'), (req) => {
        req.reply({
          body: mockDeprecatedImage,
          headers: { image: mockDeprecatedImage.id },
        });
      }).as('mockLinodeRequest');
      mount(
        <Wrapper>
          <OperatingSystems />
        </Wrapper>
      );
      // eslint-disable-next-line sonarjs/no-duplicate-string
      cy.findByPlaceholderText('Choose a Linux distribution')
        // eslint-disable-next-line sonarjs/no-duplicate-string
        .should('be.visible')
        // eslint-disable-next-line sonarjs/no-duplicate-string
        .should('be.enabled')
        .click();

      cy.contains(mockDeprecatedImage.label).should('be.visible').click();

      // eslint-disable-next-line sonarjs/no-duplicate-string
      cy.get('[data-testid="os-distro-deprecated-image-notice"]')
        .should('be.visible')
        .should(
          'contain',
          getPastDeprecatedWarningMessage(
            mockDeprecatedImage.label,
            pastDate.mmddyyyy
          )
        );
    });
    it('should display warning for deprecated image has future eol', () => {
      const futureDate = generateDate(false, 1);
      const mockDeprecatedImage = createMockImage(futureDate.yyyyMMdd, true);
      mockGetAllImages([mockDeprecatedImage]).as('mockImage');
      cy.intercept('GET', apiMatcher('/images/*'), (req) => {
        req.reply({
          body: mockDeprecatedImage,
          headers: { image: mockDeprecatedImage.id },
        });
      }).as('mockLinodeRequest');
      mount(
        <Wrapper>
          <OperatingSystems />
        </Wrapper>
      );
      cy.findByPlaceholderText('Choose a Linux distribution')
        .should('be.visible')
        .should('be.enabled')
        .click();

      cy.contains(mockDeprecatedImage.label).should('be.visible').click();

      cy.get('[data-testid="os-distro-deprecated-image-notice"]')
        .should('be.visible')
        .should(
          'contain',
          getFutureDeprecatedWarningMessage(
            mockDeprecatedImage.label,
            futureDate.mmddyyyy
          )
        );
    });
    it('should not display warning for normal images', () => {
      mockGetAllImages([mockImage]).as('mockImage');
      cy.intercept('GET', apiMatcher('/images/*'), (req) => {
        req.reply({
          body: mockImage,
          headers: { image: mockImage.id },
        });
      }).as('mockLinodeRequest');
      mount(
        <Wrapper>
          <OperatingSystems />
        </Wrapper>
      );
      cy.findByPlaceholderText('Choose a Linux distribution')
        .should('be.visible')
        .should('be.enabled')
        .click();

      cy.contains(mockImage.label).should('be.visible').click();

      cy.get('[data-testid="os-distro-deprecated-image-notice"]').should(
        'not.exist'
      );
    });
  });
});
