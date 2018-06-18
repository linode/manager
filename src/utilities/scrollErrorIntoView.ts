export default function scrollErrorIntoView() {
  const element = document.querySelectorAll('.error-for-scroll')[0];
  if (element) {
    element.scrollIntoView();
  }
}
