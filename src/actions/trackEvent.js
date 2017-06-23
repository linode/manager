export function TrackEvent(cate, action, label, value = null) {
  document.dispatchEvent(new CustomEvent('track', {
    detail: {
      cate,
      action,
      label,
      value,
    },
  }));
}
