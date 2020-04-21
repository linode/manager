const fs = require('fs');
const path = require('path');
// const mkdirp = require('mkdirp');

const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');

function compareSnapshotsPlugin(args) {
  return new Promise((resolve, reject) => {
    /* eslint-disable func-names */
    const expectedImage = path.resolve(args.expectedImage);
    const actualImage = path.resolve(args.actualImage);
    console.log(`Checking is file exist [${actualImage}, ${expectedImage}]`);
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

    fs.createReadStream(actualImage)
      .pipe(new PNG())
      .on('parsed', function() {
        const imgActual = this;
        fs.createReadStream(expectedImage)
          .pipe(new PNG())
          .on('parsed', function() {
            const imgExpected = this;

            if(imgActual.width != imgExpected.width || imgActual.height != imgExpected.height){
              const err = `The images have different sizes: w: ${imgActual.width} (${imgExpected.width}) x h: ${imgActual.height} (${imgExpected.height})`;
              console.error(err);
              throw err;
            }
            const diff = new PNG({
              width: imgActual.width,
              height: imgActual.height
            });

            const mismatchedPixels = pixelmatch(
              imgActual.data,
              imgExpected.data,
              diff.data,
              imgActual.width,
              imgActual.height,
              { threshold: 0.1 }
            );

            diff
              .pack()
              .pipe(fs.createWriteStream(path.resolve(args.diffImage)));

            resolve({
              result: {
                mismatchedPixels,
                percentage:
                  (mismatchedPixels / imgActual.width / imgActual.height) ** 0.5
              }
            });
          })
          .on('error', error => reject(error));
      })
      .on('error', error => reject(error));
    /* eslint-enable func-names */
  });
}

function deleteVisualRegFiles(args) {
  const promises = args.files.map(
    file =>
      new Promise((resolve, reject) => {
        const f = path.resolve(file);
        // console.log('file:'+f)
        if (!fs.existsSync(f)) resolve({ path: f });
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
