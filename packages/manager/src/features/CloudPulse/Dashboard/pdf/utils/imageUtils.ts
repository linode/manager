import { Alias } from '@akamai/cds-tokens';
/**
 * Converts an SVG element to a JPEG data URL for embedding in PDF
 * @param svgElement - The HTML/SVG element or file path URL to convert
 * @returns Promise resolving to an object with:
 *   - dataUrl: The JPEG data URL
 *   - width: The width of the image in pixels
 *   - height: The height of the image in pixels
 */
export const svgToDataURL = (
  source: string | SVGElement
): Promise<{ dataUrl: string; height: number; width: number }> => {
  let svgDataUrl: string;

  if (typeof source === 'string') {
    svgDataUrl = source; // It's already a file URL path
  } else {
    const serializer = new XMLSerializer();
    svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serializer.serializeToString(source))}`;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const scale = 2; // Scale up for better resolution in PDF

      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // scale context
      ctx.scale(scale, scale);

      // white background
      ctx.fillStyle = Alias.Background.Normal;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // draw SVG
      ctx.drawImage(img, 0, 0);

      const result = {
        dataUrl: canvas.toDataURL('image/jpeg', 0.92), // ✅ max quality
        width: canvas.width,
        height: canvas.height,
      };

      // cleanup
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      img.src = '';

      resolve(result);
    };

    img.onerror = reject;
    img.src = svgDataUrl;
  });
};
