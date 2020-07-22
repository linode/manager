/* eslint-disable @typescript-eslint/no-this-alias */
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');
function compareSnapshotsPlugin(args) {
  return new Promise((resolve, _reject) => {
    /* eslint-disable func-names */
    const expectedImage = path.resolve(args.expectedImage);
    const actualImage = path.resolve(args.actualImage);
    // console.log(`Checking if file exists [${actualImage}, ${expectedImage}]`);
    if (!fs.existsSync(expectedImage)) {
      console.error(`did not find ${expectedImage}`);
      resolve({
        error: `The reference snapshot for this test cannot be found ${expectedImage}`
      });
      return;
    } else {
      console.log(`found ${expectedImage}`);
    }
    if (!fs.existsSync(actualImage)) {
      console.error(`did not find ${actualImage}`);
      resolve({
        error: `The test snapshot for this test cannot be found ${actualImage}`
      });
      return;
    } else {
      console.log(`found ${actualImage}`);
    }

    Jimp.read(actualImage).then(imgActual => {
      Jimp.read(expectedImage).then(imgExpected => {
        const wRatio = imgActual.bitmap.width / imgExpected.bitmap.width;
        const hRatio = imgActual.bitmap.height / imgExpected.bitmap.height;

        const isScaled = wRatio == hRatio;
        if (isScaled) {
          console.warn(
            `detected a ratio of ${wRatio} between the expected image and the actual one, using scaled comparison`
          );
        }
        if (
          !isScaled &&
          (imgActual.bitmap.width != imgExpected.bitmap.width ||
            imgActual.bitmap.height != imgExpected.btimap.height)
        ) {
          const err = `The images have different sizes (expected): w: ${imgActual.bitmap.width} (${imgExpected.bitmap.width}) x h: ${imgActual.bitmap.height} (${imgExpected.bitmap.height})`;
          console.error(err);
          // if we keep this in, the whole test runner will crash if images aren't exactly the same
          // throw err;
        }
        const diff = Jimp.diff(
          imgExpected.quality(100).scale(wRatio),
          imgActual
        );

        diff.image.write(args.diffImage);
        console.error(`diff ${diff.percent}`);
        resolve({
          result: {
            percentage: diff.percent,
            scaled: isScaled
          }
        });
      });
    });
  });
}

function deleteVisualRegFiles(args) {
  const promises = args.files.map(
    file =>
      new Promise((resolve, reject) => {
        const f = path.resolve(file);
        // console.log('file:'+f)
        if (!fs.existsSync(f)) {
          resolve({ path: f });
        }
        // console.log('file exists, deleting it');
        fs.unlink(f, err => {
          if (err) {
            // console.error('error deleting file', f);
            reject(err);
          }
          resolve({ path: f });
        });
      })
  );
  return Promise.all(promises);
}

function registerVisualRegTasks(on) {
  on('task', { compareSnapshotsPlugin });
  on('task', { deleteVisualRegFiles });
}

module.exports = registerVisualRegTasks;
