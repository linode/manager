/* These are shortened methods that will handle finding and clicking or
finding and asserting visible without having to chain. They don't chain off of cy */
const visible = 'be.visible';

export const containsVisible = (text: string) => {
  return cy.contains(text).should(visible);
};

export const containsClick = (text: string) => {
  return cy.contains(text).click();
};

export const containsPlaceholderClick = (text: string) => {
  return cy.get(`[placeholder="${text}"]`).click();
};

export const getVisible = (element: string) => {
  return cy.get(element).should(visible);
};

export const getClick = (element: string) => {
  return cy.get(element).click();
};

export const fbtVisible = (text: string) => {
  return cy.findByText(text).should(visible);
};

export const fbtClick = (text: string) => {
  return cy.findByText(text).click();
};

export const fbltVisible = (text: string) => {
  return cy.findByLabelText(text).should(visible);
};

export const fbltClick = (text: string) => {
  return cy.findByLabelText(text).click();
};
