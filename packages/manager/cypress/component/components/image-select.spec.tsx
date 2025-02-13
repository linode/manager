/* eslint-disable sonarjs/no-duplicate-string */
import { imageFactory } from '@src/factories';
import { DateTime } from 'luxon';
import React, { useState } from 'react';
import { mockGetAllImages } from 'support/intercepts/images';
import { componentTests } from 'support/util/components';
import { randomLabel, randomNumber } from 'support/util/random';

import { ImageSelect } from 'src/components/ImageSelect/ImageSelect';

import type { Image } from '@linode/api-v4';

/**
 * @param eol - The end-of-life date for the image.
 * @param deprecated - Whether the image is deprecated.
 * @returns - A mock image object.
 */
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

/**
 * @param isPast - Whether the date should be in the past.
 * @param days - The number of days to add to the current date.
 *
 * @returns - An ISO 8601 string containing the date relative to now.
 */
const generateDate = (isPast: boolean, days: number) => {
  return isPast
    ? DateTime.now().minus({ days }).toISO()
    : DateTime.now().plus({ days }).toISO();
};

/**
 * @param imageName - The name of the image.
 * @param eol - The end-of-life date for the image.
 * @returns - The warning message for a deprecated image that has reached its end-of-life.
 */
const getPastDeprecatedWarningMessage = (
  imageName: string,
  eol: null | string
): string => {
  return `${imageName} reached its end-of-life on ${eol}. This OS distribution will no longer receive security updates or technical support. We recommend selecting a newer supported version to ensure continued security and stability for your linodes.`;
};

/**
 * @param imageName - The name of the image.
 * @param eol - The end-of-life date for the image.
 * @returns - The warning message for a deprecated image that has not yet reached its end-of-life.
 */
const getFutureDeprecatedWarningMessage = (
  imageName: string,
  eol: null | string
): string => {
  return `${imageName} will reach its end-of-life on ${eol}. After this date, this OS distribution will no longer receive security updates or technical support. We recommend selecting a newer supported version to ensure continued security and stability for your linodes.`;
};

/**
 * @returns - A test component that uses the ImageSelect component.
 */
const TestComponent = () => {
  const [selectedValue, setSelectedValue] = useState<Image | null>(null);
  return (
    <ImageSelect
      label="Linux Distribution"
      onChange={(selected) => setSelectedValue(selected)}
      placeholder="Choose a Linux distribution"
      value={selectedValue ? selectedValue.id : null}
      variant="public"
    />
  );
};

/**
 * The tests for the ImageSelect component.
 */
componentTests('ImageSelect', (mount) => {
  describe('ImageSelect Component', () => {
    it('should display warning for deprecated image has reached eol', () => {
      const pastDate = generateDate(true, 1);
      const mockPastDeprecatedImage = createMockImage(pastDate, true);
      mockGetAllImages([mockPastDeprecatedImage]);
      mount(<TestComponent />);
      cy.findByPlaceholderText('Choose a Linux distribution')
        .should('be.visible')
        .should('be.enabled')
        .click();

      cy.contains(mockPastDeprecatedImage.label).should('be.visible').click();

      cy.get('[data-testid="os-distro-deprecated-image-notice"]')
        .should('be.visible')
        .should(
          'contain',
          getPastDeprecatedWarningMessage(
            mockPastDeprecatedImage.label,
            DateTime.fromISO(pastDate).toFormat('MM/dd/yyyy')
          )
        );
    });
    it('should display warning for deprecated image has future eol', () => {
      const futureDate = generateDate(false, 1);
      const mockFutureDeprecatedImage = createMockImage(futureDate, true);
      mockGetAllImages([mockFutureDeprecatedImage]);
      mount(<TestComponent />);
      cy.findByPlaceholderText('Choose a Linux distribution')
        .should('be.visible')
        .should('be.enabled')
        .click();
      cy.contains(mockFutureDeprecatedImage.label).should('be.visible').click();
      cy.get('[data-testid="os-distro-deprecated-image-notice"]')
        .should('be.visible')
        .should(
          'contain',
          getFutureDeprecatedWarningMessage(
            mockFutureDeprecatedImage.label,
            DateTime.fromISO(futureDate).toFormat('MM/dd/yyyy')
          )
        );
    });
    it('should not display warning for normal images', () => {
      const mockImage = createMockImage(null, false);
      mockGetAllImages([mockImage]);
      mount(<TestComponent />);
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
