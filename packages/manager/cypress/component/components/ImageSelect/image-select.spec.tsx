import * as React from 'react';
import { componentTests } from 'support/util/components';

import { ImageSelect } from 'src/components/ImageSelect/ImageSelect';

import { mockGetAllImages } from 'support/intercepts/images';
import { apiMatcher } from 'support/util/intercepts';
import { imageFactory } from '@src/factories';
import { randomLabel, randomNumber } from 'support/util/random';

const mockImage = imageFactory.build({
  label: randomLabel(),
  is_public: true,
  eol: '2024-12-26T04:00:00',
  deprecated: true,
  id: `public/${randomNumber()}`,
  status: 'available',
});

componentTests('Select', (mount) => {
  describe('ImageSelect Component', () => {
    it('shows a warning for deprecated images when selected', () => {
      mockGetAllImages([mockImage]).as('mockImage');
      cy.intercept('GET', apiMatcher('/images/*'), (req) => {
        req.reply({
          body: mockImage,
          headers: { image: mockImage.id },
        });
      }).as('mockLinodeRequest');
      mount(
        <ImageSelect
          label="Linux Distribution"
          onChange={() => {}}
          placeholder="Choose a Linux distribution"
          variant="public"
          value=""
        />
      );
    });
  });
});
