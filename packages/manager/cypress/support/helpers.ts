const visible = 'be.visible';

export const containsVisibleClick = text => {
  return cy
    .contains(text)
    .should(visible)
    .click();
};

export const getVisibleClick = element => {
  return cy
    .get(element)
    .should(visible)
    .click();
};

export const fbtVisibleClick = text => {
  return cy
    .findByText(text)
    .should(visible)
    .click();
};
