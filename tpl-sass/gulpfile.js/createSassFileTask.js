const gulp = require('gulp');
const tap = require('gulp-tap');
const path = require('path');
const fs = require('fs');
const watch = require('gulp-watch');

// 配置变量：指定_common.scss文件路径
const commonPath = 'app/sass/_common.scss';

function writeContent(rootPath, scssFileDirPath) {
  const commonRealPath = `${rootPath}/${commonPath}`;
  const relativePath = path.relative(scssFileDirPath, commonRealPath);
  const content = `@import '${relativePath}';`;
  return content;
}

function createSassFile(rootPath) {

  return gulp.src('app/**/*.wxss').pipe(tap(file => {

    const filePath = path.dirname(file.path);
    const fileName = path.basename(file.path, '.wxss');

    const scssFileRealPath = `${filePath}/${fileName}.scss`;
    const scssFileRelativePath = path.relative(rootPath, scssFileRealPath);

    if (fs.existsSync(scssFileRealPath)) {
      console.log(`${scssFileRelativePath}文件已创建`);
    } else {
      const content = writeContent(rootPath, filePath);
      fs.appendFile(scssFileRealPath, content, 'utf8', function(err) {
        if (err) {
          console.log(`${scssFileRelativePath}文件创建失败`);
        }
        console.log(`${scssFileRelativePath}文件创建成功`);
      });
    }
  }));
}

exports.createSassFileTask = function() {

  const rootPath = path.resolve();

  return createSassFile(rootPath);
};

exports.createSassFileWatchTask = function() {

  const rootPath = path.resolve();

  watch('app/**/*.wxss', {
    events: ['add'],
  }, function() {
    return createSassFile(rootPath);
  });

}