/*
 * Improved version of the solution presented at
 * https://dev.to/nektro/createimagebitmap-polyfill-for-safari-and-edge-228
 *
 * Note that this implementation only supports File, Blob or MediaSource as the parameter due to
 * the use of URL.createObjectURL. A native implementation of createImageBitmap also supports
 * HTMLImageElement, SVGImageElement and others as the parameter. As this is implemented as a
 * polyfill it will not replace a native implementation of createImageBitmap
 */

/*
 * Safari and Edge polyfill for createImageBitmap
 * https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/createImageBitmap
 */
if (!('createImageBitmap' in window)) {
  (window as any).createImageBitmap = (imageData: any) => {
    return new Promise((resolve, _) => {
      const img = document.createElement('img');
      img.addEventListener('load', function() {
        resolve(this);
      });
      img.src = URL.createObjectURL(imageData);
    });
  };
}
