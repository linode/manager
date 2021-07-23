import { createMockImage, makeImageLabel } from '../../support/api/images';
import { createLinode, deleteLinodeById } from '../../support/api/linodes';
import {
  containsClick,
  fbtClick,
  fbtVisible,
  getClick,
  getVisible,
} from '../../support/helpers';

const mockImage = createMockImage().data[0];
const imageLabel = mockImage.label;
const regionSelect = 'Atlanta, GA';

describe('upload machine image, mocked', () => {
  it('uploads machine image', () => {
    cy.visitWithLogin('/images/create/upload');
    getClick('[id="label-(required)"]').type(imageLabel);
    getClick('[id="description"]').type('This is a machine image upload test');
    fbtClick('Select a Region');
    fbtClick(regionSelect);
    fbtClick('Browse Files').click();
  });
});
