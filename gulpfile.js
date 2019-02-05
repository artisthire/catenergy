var gulp = require('gulp');
var plumber = require('gulp-plumber');
var gulpSequence = require('gulp-sequence');
var gulpIf = require('gulp-if');
var size = require('gulp-size');
// var newer = require('gulp-newer');
var changed = require('gulp-changed');
var debug = require('gulp-debug');
var notify = require('gulp-notify');
var rename = require('gulp-rename');
var fileinclude = require('gulp-file-include');
//var gulpMerge = require('gulp-merge');
var browserSync = require('browser-sync').create();
var fs = require('fs');
var del = require('del');

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

var uglify = require('gulp-uglify');

//!здесь устанавливаются переменный с директориями для исходных файлов
var source_root_dir = 'source/';
var source_html = source_root_dir + '*.html';
//шаблоны html, которые подключаются в основные файлы с помощью file-include
var source_html_templates = source_root_dir + 'html_templates/*.html';
var source_scss = source_root_dir + 'scss/*.scss';
//файл - диспетчер подключений из блоков
var source_scss_file = source_root_dir + 'scss/style.scss';
//ссылка на scss файлы в блоках для слежения в gulp.watch
var source_blocks = source_root_dir + 'blocks/**/*.scss';
var source_img = source_root_dir + 'img/';
var source_img_optim = source_root_dir + 'img/img-optim/';
var source_img_webp = source_root_dir + 'img/img-webp/';
var source_favicon = source_root_dir + 'img/favicon/*';
var source_js = source_root_dir + 'js/*.js';
var source_font = source_root_dir + 'font/*.{woff,woff2}';
//папки с сторонними библиотеками, полифилами, файлы из которых копируются как есть
var source_libs_css = source_root_dir + 'libs/css/*.css';
var source_libs_js = source_root_dir + 'libs/js/*.js';
//папка в которой собирается спрайт для инлайнинга в HTML
var source_svg_sprite = source_root_dir + 'img/sprite-svg/';
//используется для указания директории при инлайнинге растровых картинок в CSS
var source_img_to_bg = source_root_dir + 'blocks/**/img_bgn/';

//!здесь устанавливаются переменные с директориями для результатов обработки
var build_root_dir = 'build/';
var build_css = build_root_dir + 'css/';
var build_img = build_root_dir + 'img/';
var build_svg_sprite = build_root_dir + 'img/sprite-svg/';
var build_favicon = build_root_dir + 'favicon/';
var build_font = build_root_dir + 'font/';
var build_js = build_root_dir + 'js/';

//флаг, устанавливающий разработка это или сборка для продакшина
var isDev = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

// Плагины postCSS, которыми обрабатываются все стилевые файлы
var postCssPlugins = [
  autoprefixer({browsers: ["ie >= 11", "last 2 versions"]}),
  mqpacker({
    sort: true
  }),
  inlineSVG(),
  imageInliner({
    assetPaths: [source_img_to_bg],
    maxFileSize: 10240
  }),
  cssnano()
];

//обработка файлов html
gulp.task('html', function () {
  console.log('---------- Компиляция HTML');
  return gulp.src(source_html)
  .pipe(plumber({
    errorHandler: function(err) {
      notify.onError({
        title: 'HTML compilation error',
        message: err.message
      })(err);
      this.emit('end');
    }
  }))
  .pipe(fileinclude({
    prefix: '@@',
    basepath: '@file',
    indent: true
  }))
  .pipe(gulp.dest(build_root_dir))
  .pipe(browserSync.reload({stream:true}));
});

//сортировка атрибутов в тегах html
//выполняется один раз для исходных файлов, чтобы атрибут класса был в начале тега
gulp.task('html-sort',function() {
  console.log('---------- Сортировка атрибутов в тегах (делается в исходниках)');
  return gulp.src([source_root_dir + '*.html', source_root_dir +'blocks/**/*.html'])
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
  return gulp.src(source_scss_file)
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
  // .pipe(debug({title: "Style:"}))
  .pipe(sass())
  .pipe(postcss(postCssPlugins))
  .pipe(rename({suffix: '.min'}))
  .pipe(gulpIf(isDev, sourcemaps.write('/')))
  .pipe(gulp.dest(build_css))
  .pipe(browserSync.stream());
});

gulp.task('style:copy', function() {
  console.log('---------- Копирование стилей');
  return gulp.src(source_libs_css)
  .pipe(gulp.dest(build_css))
  .pipe(browserSync.stream());
});

gulp.task('js', function() {
  console.log('---------- Компиляция JS');
  return gulp.src(source_js)
  .pipe(plumber({
    errorHandler: function(err) {
      notify.onError({
        title: 'Javascript compilation error',
        message: err.message
      })(err);
      this.emit('end');
    }
  }))
  .pipe(gulpIf(isDev, sourcemaps.init()))
  .pipe(uglify())
  .pipe(rename({suffix: '.min'}))
  .pipe(gulpIf(isDev, sourcemaps.write('/')))
  .pipe(gulp.dest(build_js))
  .pipe(browserSync.reload({stream:true}));
});

gulp.task('js:copy', function() {
  console.log('---------- Копирование JS файлов');
  return gulp.src(source_libs_js)
  .pipe(gulp.dest(build_js))
  .pipe(browserSync.reload({stream:true}));
});

// Ручная оптимизация изображений
// Использование: folder=source/img npm start img:opt
// var folder = process.env.folder;
// Оптимизация изображений
gulp.task('img:opt', function () {
  var imagemin = require('gulp-imagemin');
  var gulpPngquant = require('gulp-pngquant');
  //var pngquant = require('imagemin-pngquant');
  //Для минимизации используется отдельный плагин pngquant, поскольку imagemin-pngquant выдает ошибку
  console.log('---------- Оптимизация картинок');
  return gulp.src(source_img + "*.{jpg,jpeg,gif,svg,png}")
    .pipe(changed(source_img_optim))
    .pipe(gulpIf(function (file) {
      return file.extname == '.png';},
      gulpPngquant({quality: '65-80'}),
      imagemin([
    	imagemin.gifsicle({interlaced: true}),
    	imagemin.jpegtran({progressive: true}),
    	imagemin.svgo({removeViewBox: false})
      ])))
    .pipe(gulp.dest(source_img_optim));

  //   .pipe(imagemin([
  // 	imagemin.gifsicle({interlaced: true}),
  // 	imagemin.jpegtran({progressive: true}),
  // 	imagemin.svgo({removeViewBox: false})
  //   ]))
  //   .pipe(gulp.dest(source_img_optim));
  //
  // gulp.src(source_img + "*.png")
  //   .pipe(changed(source_img_optim))
  //   .pipe(gulpPngquant({
  //       quality: '65-80'
  //   }))
  //   .pipe(gulp.dest(source_img_optim));
  //
  //   done();
});

gulp.task("img:webp", function () {
  var webp = require('gulp-webp');

  console.log('---------- Создание картинок webp');
  return gulp.src(source_img + "*.{jpg,jpeg,gif,png}")
  .pipe(changed(source_img_webp, {extension: '.webp'}))
  .pipe(debug({'title':' image:webp'}))
  .pipe(webp({quality: 90}))
  .pipe(gulp.dest(source_img_webp));
});


gulp.task('img', function() {
  console.log('---------- Копирование картинок');
  return gulp.src([source_img_webp + '*', source_img_optim + '*'])
  .pipe(changed(build_img))
  .pipe(gulp.dest(build_img))
  .pipe(browserSync.reload({stream:true}));
});

//копирование фавиконок в корень директории сайта
gulp.task('favicon', function() {
  console.log('---------- Копирование фавиконок');
  return gulp.src(source_favicon)
  .pipe(changed(build_favicon))
  .pipe(gulp.dest(build_favicon))
  .pipe(browserSync.reload({stream:true}));
});

gulp.task('sprite:svg', function() {

  if(fileExist(source_svg_sprite) !== false) {
     console.log('---------- Сборка SVG спрайта');
     return gulp.src(source_svg_sprite + "*.svg")
       .pipe(svgmin({
         plugins: [
           {minifyStyles: true},
           {cleanupIDs: {
             minify: true
           }}
         ]
       }))
       .pipe(svgstore({ inlineSvg: false}))
       .pipe(cheerio({
         run: function($) {
           // $('svg').attr('style',  'display:none');
           $('symbol').attr('fill',  'currentColor');
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
       .pipe(gulp.dest(build_svg_sprite));
   }
   else {
     console.log('---------- Сборка SVG спрайта: ОТМЕНА, нет папки с картинками');
   }
});

gulp.task('font', function() {
  console.log('---------- Копирование шрифтов');
  return gulp.src(source_font)
  .pipe(changed(build_font))
  .pipe(gulp.dest(build_font))
  .pipe(browserSync.reload({stream:true}));
});

gulp.task('clean', function(done) {
  console.log('---------- Очистка рабочей директории');
  del.sync(build_root_dir);
  done();
});

gulp.task('serve', function () {
    browserSync.init({
        server: build_root_dir,
        open: false,
        port: 8080,
        ui: false
    });
});

gulp.task('watch', function() {
  gulp.watch([source_html, source_html_templates],gulp.series('html'));
  gulp.watch([source_scss, source_blocks], gulp.series('style'));
  gulp.watch(source_libs_css, gulp.series('style:copy'));
  gulp.watch(source_js, gulp.series('js'));
  gulp.watch(source_libs_js, gulp.series('js:copy'));
  gulp.watch(source_img + '*.{jpg,jpeg,gif,png,svg}', gulp.series('img:opt', 'img:webp', 'img'));
  gulp.watch(source_favicon, gulp.series('favicon'));
  gulp.watch(source_font, gulp.series('font'));
  gulp.watch(source_img_to_bg + '*', gulp.series('style'));
  // gulp.watch(source_svg_sprite + '*.svg', ['sprite:svg', 'html']);
  gulp.watch(source_svg_sprite + '*.svg', gulp.series('sprite:svg', 'html'));
});

gulp.task('build', gulp.series(
  'clean', 'sprite:svg', 'img:opt', 'img:webp', 'img',
  gulp.parallel('html', 'style', 'style:copy', 'js', 'js:copy', 'favicon', 'font')
));

gulp.task('default', gulp.series('build', gulp.parallel('watch', 'serve')));

/**
 * Проверка существования файла или папки
 * @param  {string} filepath      Путь до файла или папки
 * @return {boolean}
 */
function fileExist (filepath) {
  var flag = true;
  try{
    fs.accessSync(filepath, fs.F_OK);
  } catch(e) {
    flag = false;
  }
  return flag;
}
