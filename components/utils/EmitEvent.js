export const FORM_SUBMIT = 'form:submit';
export const MODAL_CANCEL = 'modal:cancel';
export const MODAL_CLOSE = 'modal:close';
export const MODAL_SHOW = 'modal:show';
export const SELECT_CHANGE = 'select:change';
export const DROPDOWN_OPEN = 'dropdown:open';
export const DROPDOWN_CLICK = 'dropdown:click';
export const DROPDOWN_CLOSE = 'dropdown:close';

export const EVENTS = [
  FORM_SUBMIT,
  MODAL_CANCEL,
  MODAL_CLOSE,
  MODAL_SHOW,
  SELECT_CHANGE,
  DROPDOWN_OPEN,
  DROPDOWN_CLICK,
  DROPDOWN_CLOSE,
];

export default function EmitEvent(eventName, category, action, label, value = null) {
  document.dispatchEvent(new CustomEvent(eventName, {
    detail: {
      category,
      action,
      label,
      value,
    },
  }));
}
