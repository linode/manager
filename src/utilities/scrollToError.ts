export default function scrollToError(name: string) {
  const el = (document as any).querySelector(`[name=${name}]`).offsetParent;
  el.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'center' });
}
