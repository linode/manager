// const escapeStringForCLI = (value: string) => {
//   const doesContainEscapableChars = value.match(/[^\w\s]/gi);
//   let parsedValue = value;
//   if (doesContainEscapableChars) {
//     parsedValue = value.replace(/[^\w\s]/gi, function (char) {
//       return '\\' + char;
//     });
//     return parsedValue;
//   }
//   return value;
// };

const escapeStringForCLI = (value: string) => {
  return value.replace(/(["'$`\\])/g, '\\$1');
};

export default escapeStringForCLI;
