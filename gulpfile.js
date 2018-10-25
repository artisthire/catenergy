var gulp = require('gulp');
var plumber = require('gulp-plumber');
var gulpSequence = require('gulp-sequence');
var browserSync = require('browser-sync').create();
var clean = require('del');

var posthtml = require('gulp-posthtml');
var posthtmlInclude = require('posthtml-include');

var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var sourcemaps = require('gulp-sourcemaps');


gulp.task('html',function() {
  gulp.src('source/*.html')
  .pipe(plumber({
    handleError: function (err) {
        console.log(err);
        this.emit('end');
    }
  }))
  .pipe(posthtml([
    posthtmlInclude()
  ]))
  .pipe(gulp.dest('build/'))
  .pipe(browserSync.reload({stream:true}))
});

gulp.task('style', function() {
  gulp.src('source/scss/style.scss')
  .pipe(plumber({
    handleError: function (err) {
        console.log(err);
        this.emit('end');
    }
  }))
  .pipe(sourcemaps.init())
  .pipe(sass())
  .pipe(postcss([
    autoprefixer()
  ]))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('build/css/'))
  .pipe(browserSync.stream());
})

gulp.task('img', function() {
  gulp.src('source/img/*')
  .pipe(gulp.dest('build/img/'))
})

gulp.task('clean', function() {
  clean.sync('build');
})

gulp.task('serve', ['html', 'style', 'img'], function() {
    browserSync.init({
        server: 'build/',
        open: false,
        port: 8080,
        ui: false
    });

    gulp.watch(['source/scss/*.scss', 'source/blocks/**/*.scss'], ['style']);
    gulp.watch(['source/*.html','source/blocks/**/*.html'],['html']);
    gulp.watch('source/img/*','img');
});

gulp.task('default', gulpSequence('clean', 'serve'));
