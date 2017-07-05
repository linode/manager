// TODO: use rest/spread for generic args
export default function EmitEvent(eventName, category, action, label, value = null) {
  document.dispatchEvent(new CustomEvent(eventName, {
    detail: {
      category,
      action,
      label,
      value,
    }
  }));
  console.log(category, eventName);
}
