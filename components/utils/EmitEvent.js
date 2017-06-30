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
<<<<<<< c7535c24a36c05142dc2aa79dc930d95246d4d88
=======
  console.log(category, eventName);
>>>>>>> rename TrackEvent to EmitEvent
}
