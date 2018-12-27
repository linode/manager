export const deriveDefaultLabel = (
  imageID: string | null,
  regionID: string | null,
  typeID: string | null ): string => {

    // TODO: map to custom ID abbreviations

    // Some params might be null, so filter those out
    return [imageID, regionID, typeID].filter(Boolean).join('-');
}
export default deriveDefaultLabel;
