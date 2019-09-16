const { constants } = require('../../constants');
const { assertLog } = require('../../utils/assertionLog');

import Page from '../page';

class Invoice extends Page {
  get backToBilling() {
    return $('[data-qa-back-to-billing]');
  }
  get invoiceID() {
    return $('[data-qa-invoice-id]');
  }
  get invoiceTotal() {
    return $('[data-qa-total]');
  }
  get landingInvoiceTotal() {
    return $('[data-qa-total]');
  }
  get descriptionRows() {
    return $$('[data-qa-description]');
  }
  get fromRows() {
    return $$('data-qa-from');
  }
  get toRows() {
    return $$('[data-qa-to]');
  }
  get quantityRows() {
    return $$('[data-qa-quantity]');
  }
  get unitPriceRows() {
    return $$('[data-qa-unit-price]');
  }
  get amountRows() {
    return $$('[data-qa-amount]');
  }
  get openPrintableInvoice() {
    return $('[data-qa-printable-invoice]');
  }
  //Printable page
  get linodeLogo() {
    return $('[data-qa-linode-logo]');
  }
  get remitToHeader() {
    return $('[data-qa-remit-to]');
  }
  get invoiceToHeader() {
    return $('[data-qa-invoice-to]');
  }

  expectedColumnsDisplay() {
    const tableColumns = [
      'Description',
      'From',
      'To',
      'Quantity',
      'Unit Price',
      'Amount'
    ];
    tableColumns.forEach(col => {
      expect($(`[data-qa-column="${col}"]`).isDisplayed())
        .withContext(
          `"[data-qa-column="${col}"]" selector ${assertLog.displayed}`
        )
        .toBe(true);
    });
  }
}

export default new Invoice();
