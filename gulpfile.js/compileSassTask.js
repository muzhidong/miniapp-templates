const gulp = require('gulp');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const nodeSass = require('node-sass');
const watch = require('gulp-watch');

function compileSass() {

  return gulp.src('app/**/*.scss')
    .pipe(sass.sync({
      outputStyle: 'expanded'
    }).on('error', sass.logError))
    .pipe(rename({
      extname: '.wxss',
    }))
    .pipe(gulp.dest('app'));
}

exports.compileSassTask = function() {

  sass.compiler = nodeSass;

  return compileSass();
};

exports.compileSassWatchTask = function() {

  sass.compiler = nodeSass;

  watch('app/**/*.scss', {
    events: ['change'],
  }, function() {
    return compileSass();
  });

}