var gulp = require('gulp');
var plumber = require('gulp-plumber');
var gulpSequence = require('gulp-sequence');
//var gulpMerge = require('gulp-merge');
var browserSync = require('browser-sync').create();
var clean = require('del');

var posthtml = require('gulp-posthtml');
//var posthtmlInclude = require('posthtml-include');
var posthtmlInclude = require('posthtml-modules');
var posthtmlAttrSort = require('posthtml-attrs-sorter');

var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
//var doiuse = require('doiuse')


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
  .pipe(browserSync.reload({stream:true}));
});

// return gulpMerge(
//   gulp.src('source/*.html',{base: './source'}),
//   gulp.src('source/blocks/**/*.html',{base: './source/blocks/'})
// )

//сортировка атрибутов в тегах html

gulp.task('html-sort',function() {

  gulp.src(['source/*.html','source/blocks/**/*.html'])
  .pipe(plumber({
    handleError: function (err) {
        console.log(err);
        this.emit('end');
    }
  }))
  .pipe(posthtml([
    posthtmlAttrSort(
      {
        "order": [
          "class", "id", "name",
          "data-.+", "ng-.+", "src",
          "for", "type", "href",
          "values", "title", "alt",
          "role", "aria-.+",
          "$unknown$"
        ]
      }
    )
  ]))
  .pipe(gulp.dest(function(file) {
    if (file.base) return file.base;
  }));
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
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('build/css/'))
  .pipe(browserSync.stream());
});

gulp.task('css', function() {
  gulp.src('source/css/*.css')
  .pipe(gulp.dest('build/css'));
});

gulp.task('js', function() {
  gulp.src('source/js/*.js')
  .pipe(gulp.dest('build/js'));
});

gulp.task('img', function() {
  gulp.src('source/img/*')
  .pipe(gulp.dest('build/img/'));
});

//копирование фавиконок в корень директории сайта
gulp.task('favicon', function() {
  gulp.src('source/img/favicon/*')
  .pipe(gulp.dest('build/'));
});

gulp.task('font', function() {
  gulp.src('source/font/*')
  .pipe(gulp.dest('build/font/'));
});

gulp.task('clean', function() {
  clean.sync('build');
});

gulp.task('serve', ['html', 'style', 'css', 'js', 'img', 'favicon', 'font'], function() {
    browserSync.init({
        server: 'build/',
        open: false,
        port: 8080,
        ui: false
    });

    gulp.watch(['source/scss/*.scss', 'source/blocks/**/*.scss'], ['style']);
    gulp.watch(['source/*.html','source/blocks/**/*.html'],['html']);
    gulp.watch('source/css/*.css',['css']);
    gulp.watch('source/js/*.js',['js']);
    gulp.watch('source/img/*',['img']);
    gulp.watch('source/img/favicon/*',['favicon']);
    gulp.watch('source/font/*',['font']);
});

gulp.task('default', gulpSequence('clean', 'serve'));
