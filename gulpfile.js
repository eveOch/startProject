const { watch, src, dest, parallel, series } = require('gulp');
const pug = require('gulp-pug');
const imagemin = require('gulp-imagemin');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const browserSync = require('browser-sync');

function devServer(cb) {
    var params = {
      watch: true,
      reloadDebounce: 150,
      notify: false,
      server: { baseDir: './build' },
    };
  
    browserSync.create().init(params);
    cb();
  }
  

function buildPages() {
    // Пути можно передавать массивами
    return src(['src/pages/index.pug', 'src/pages/*.html'])
      .pipe(pug({
          pretty: true
      }))
      .pipe(dest('build/'));
  }
  

  function buildStyles() {
    return src('src/styles/*.sass')
      .pipe(sass())
      .pipe(postcss([
        autoprefixer({
          browsers: ['last 2 versions'],
          cascade: false
      })
      ]))
      .pipe(dest('build/styles/'));
  }
  

function buildScripts() {
  return src('src/scripts/**/*.js')
    .pipe(dest('build/scripts/'));
}

function buildAssets(cb) {
    // Уберём пока картинки из общего потока
    src(['src/assets/**/*.*', '!src/assets/img/**/*.*'])
      .pipe(dest('build/assets/'));
  
    src('src/assets/img/**/*.*')
      .pipe(imagemin())
      .pipe(dest('build/assets/img'));
  
    // Раньше функция что-то вовзращала, теперь добавляем вместо этого искусственый колбэк
    // Это нужно, чтобы Галп понимал, когда функция отработала и мог запустить следующие задачи
    cb();
  }
function watchFiles() {
    watch(['src/pages/*.pug', 'src/pages/*.html'], buildPages);
    watch('src/styles/*.sass', buildStyles);
    watch('src/scripts/**/*.js', buildScripts);
    watch('src/assets/**/*.*', buildAssets);
}

// Соберём и начнём следить
exports.default =
  parallel(
    devServer,
    series(
      parallel(buildPages, buildStyles, buildScripts, buildAssets),
      watchFiles
    )
  );