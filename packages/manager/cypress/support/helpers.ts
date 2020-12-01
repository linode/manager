const visible = 'be.visible';

export const containsClick = text => {
  return cy.contains(text).click();
};

export const getClick = element => {
  return cy.get(element).click();
};

export const fbtClick = text => {
  return cy.findByText(text).click();
};

export const containsVisible = text => {
  return cy.contains(text).should(visible);
};

export const getVisible = element => {
  return cy.get(element).should(visible);
};

export const fbtVisible = text => {
  return cy.findByText(text).should(visible);
};
