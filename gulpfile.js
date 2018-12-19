var gulp = require('gulp');
var plumber = require('gulp-plumber');
var gulpSequence = require('gulp-sequence');
var gulpIf = require('gulp-if');
var size = require('gulp-size');
var newer = require('gulp-newer');
var debug = require('gulp-debug');
var notify = require('gulp-notify');
var rename = require('gulp-rename');
var fileinclude = require('gulp-file-include');
//var gulpMerge = require('gulp-merge');
var browserSync = require('browser-sync').create();
var fs = require('fs');
var clean = require('del');

var posthtml = require('gulp-posthtml');
//var posthtmlInclude = require('posthtml-include');
//var posthtmlInclude = require('posthtml-modules');
var posthtmlAttrSort = require('posthtml-attrs-sorter');

var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var mqpacker = require("css-mqpacker");
var inlineSVG = require('postcss-inline-svg');
var imageInliner = require('postcss-image-inliner');
var cssnano = require('cssnano');
//var gcmq = require('gulp-group-css-media-queries');
//var csso = require('gulp-csso');

var svgstore = require('gulp-svgstore');
var svgmin = require('gulp-svgmin');
var cheerio = require('gulp-cheerio');


//var doiuse = require('doiuse')

var spriteSvgDir = 'source/img/sprite-svg/';

//флаг, устанавливающий разработка это или сборка для продакшина
var isDev = true;

// Плагины postCSS, которыми обрабатываются все стилевые файлы
var postCssPlugins = [
  autoprefixer({browsers: ["ie >= 11", "last 2 versions", "not dead"]}),
  mqpacker({
    sort: true
  }),
  inlineSVG(),
  imageInliner({
    assetPaths: ['source/blocks/**/img_bgn/'],
    maxFileSize: 10240
  }),
  cssnano()
];

// atImport(),
// inlineSVG(),
// objectFitImages(),
// imageInliner({
//   assetPaths: ['src/blocks/**/img_to_bg/'],
//   maxFileSize: 10240
// })

//обработка файлов html
gulp.task('html',function() {
  console.log('---------- Компиляция HTML');
  gulp.src('source/*.html')
  .pipe(plumber({
    handleError: function (err) {
        console.log(err);
        this.emit('end');
    }
  }))
  .pipe(fileinclude({
    prefix: '@@',
    basepath: '@file',
    indent: true
  }))
  .pipe(size({
    title: 'Размер',
    showFiles: true,
    showTotal: false,
  }))
  .pipe(gulp.dest('build/'))
  .pipe(browserSync.reload({stream:true}));
});

//сортировка атрибутов в тегах html
//выполняется один раз для исходных файлов, чтобы атрибут класса был в начале тега
gulp.task('html-sort',function() {
  console.log('---------- Сортировка атрибутов в тегах (делается в исходниках)');
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

//обработка стилевых файлов
gulp.task('style', function() {
  console.log('---------- Компиляция стилей');
  gulp.src('source/scss/style.scss')
  .pipe(plumber({
    errorHandler: function(err) {
      notify.onError({
        title: 'Styles compilation error',
        message: err.message
      })(err);
      this.emit('end');
    }
  }))
  .pipe(gulpIf(isDev, sourcemaps.init()))
  .pipe(debug({title: "Style:"}))
  .pipe(sass())
  .pipe(postcss(postCssPlugins))
  .pipe(rename({suffix: '.min'}))
  .pipe(gulpIf(isDev, sourcemaps.write('/')))
  .pipe(size({
    title: 'Размер',
    showFiles: true,
    showTotal: false,
  }))
  .pipe(gulp.dest('build/css/'))
  .pipe(browserSync.stream());
});

gulp.task('css', function() {
  console.log('---------- Копирование стилей');
  gulp.src('source/css/*.css')
  .pipe(postcss(postCssPlugins))
  .pipe(size({
    title: 'Размер',
    showFiles: true,
    showTotal: false,
  }))
  .pipe(gulp.dest('build/css'));
});

gulp.task('js', function() {
  console.log('---------- Компиляция JS');
  gulp.src('source/js/*.js')
  .pipe(gulp.dest('build/js'));
});

gulp.task('img', function() {
  console.log('---------- Копирование картинок');
  gulp.src('source/img/*')
  .pipe(newer('build/img/'))
  .pipe(size({
    title: 'Размер',
    showFiles: true,
    showTotal: false,
  }))
  .pipe(gulp.dest('build/img/'));
});

//копирование фавиконок в корень директории сайта
gulp.task('favicon', function() {
  console.log('---------- Копирование фавиконок');
  gulp.src('source/img/favicon/*')
  .pipe(newer('build/'))
  .pipe(size({
    title: 'Размер',
    showFiles: true,
    showTotal: false,
  }))
  .pipe(gulp.dest('build/'));
});

gulp.task('sprite:svg', function() {

  if(fileExist(spriteSvgDir) !== false) {
     console.log('---------- Сборка SVG спрайта');
     return gulp.src(spriteSvgDir + '*.svg')
       .pipe(svgmin({
         plugins: [
           {minifyStyles: true}
         ]
        },
         function (file) {
         return {
           plugins: [{
             cleanupIDs: {
               minify: true
             }
           }]
         };
       }))
       .pipe(svgstore({ inlineSvg: true }))
       .pipe(cheerio({
         run: function($) {
           $('svg').attr('style',  'display:none');
         },
         parserOptions: {
           xmlMode: true
         }
       }))
       .pipe(rename('sprite-svg.svg'))
       .pipe(size({
         title: 'Размер',
         showFiles: true,
         showTotal: false,
       }))
       .pipe(gulp.dest(spriteSvgDir + 'img/'));
   }
   else {
     console.log('---------- Сборка SVG спрайта: ОТМЕНА, нет папки с картинками');
   }
});

gulp.task('font', function() {
  console.log('---------- Копирование шрифтов');
  gulp.src('source/font/*')
  .pipe(newer('build/font/'))
  .pipe(size({
    title: 'Размер',
    showFiles: true,
    showTotal: false,
  }))
  .pipe(gulp.dest('build/font/'));
});

gulp.task('clean', function() {
  console.log('---------- Очистка рабочей директории');
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
    gulp.watch(['source/*.html','source/includes/*.html'],['html']);
    gulp.watch('source/css/*.css',['css']);
    gulp.watch('source/js/*.js',['js']);
    gulp.watch('source/img/*',['img']);
    gulp.watch('source/img/favicon/*',['favicon']);
    gulp.watch('source/font/*',['font']);
    gulp.watch(spriteSvgDir + '*',['sprite:svg', 'html']);
});

gulp.task('default', gulpSequence('clean', 'serve'));


/**
 * Проверка существования файла или папки
 * @param  {string} filepath      Путь до файла или папки
 * @return {boolean}
 */
function fileExist(filepath) {
  var flag = true;
  try{
    fs.accessSync(filepath, fs.F_OK);
  } catch(e) {
    flag = false;
  }
  return flag;
}
