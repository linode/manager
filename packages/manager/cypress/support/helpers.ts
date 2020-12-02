const visible = 'be.visible';

export const containsVisible = text => {
  return cy.contains(text).should(visible);
};

export const containsVisibleClick = text => {
  return cy.contains(text).click();
};

export const getVisible = element => {
  return cy.get(element).should(visible);
};

export const getVisibleClick = element => {
  return cy.get(element).click();
};

export const fbtVisible = text => {
  return cy.findByText(text).should(visible);
};

export const fbtVisibleClick = text => {
  return cy.findByText(text).click();
};
