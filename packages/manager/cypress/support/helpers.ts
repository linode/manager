/* These are shortened methods that will handle finding and clicking or
finding and asserting visible without having to chain. They don't chain off of cy */
const visible = 'be.visible';

export const containsVisible = (text) => {
  return cy.contains(text).should(visible);
};

export const containsClick = (text) => {
  return cy.contains(text).click();
};

export const containsPlaceholderClick = (text) => {
  return cy.get(`[placeholder="${text}"]`).click();
};

export const getVisible = (element) => {
  return cy.get(element).should(visible);
};

export const getClick = (element) => {
  return cy.get(element).click();
};

export const fbtVisible = (text) => {
  return cy.findByText(text).should(visible);
};

export const fbtClick = (text) => {
  return cy.findByText(text).click();
};

export const fbltVisible = (text) => {
  return cy.findByLabelText(text).should(visible);
};

export const fbltClick = (text) => {
  return cy.findByLabelText(text).click();
};
