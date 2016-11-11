var gulp = require('gulp');
var clean = require('gulp-clean');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var merge = require('merge-stream');
var replace = require('gulp-replace');

gulp.task('clean', function() {
  return gulp.src('dist', {read: false}).pipe(clean());
});

gulp.task('copy', ['clean'], function() {
  return gulp.src('node_modules/materialize-css/fonts/*/**').pipe(gulp.dest('dist/fonts'));
});

var processors = [autoprefixer({
  browsers: ['last 2 versions', 'Chrome >= 30', 'Firefox >= 30', 'ie >= 10', 'Safari >= 8']
})];

var primaryColors = [
  'red',
  'pink',
  'purple',
  'deep-purple',
  'indigo',
  'blue',
  'light-blue',
  'cyan',
  'teal',
  'green',
  'light-green',
  'lime',
  'yellow',
  'amber',
  'orange',
  'deep-orange',
  'brown',
  'grey',
  'blue-grey'
];

var secondaryColors = primaryColors.slice(0, primaryColors.length - 3);

var lightColors = [
  'lime',
  'yellow',
  'amber',
  'grey'
];

gulp.task('sass:expanded', ['copy'], function() {
  var themes = primaryColors.map(primaryColor => {
    var primaryIsLight = lightColors.indexOf(primaryColor) >= 0;
    return secondaryColors.map(secondaryColor => {
      var secondaryIsLight = lightColors.indexOf(secondaryColor) >= 0;

      return gulp.src('template.scss')
        .pipe(replace('PRIMARY_COLOR', primaryColor))
        .pipe(replace('SECONDARY_COLOR', secondaryColor))
        .pipe(replace('PRIMARY_IS_LIGHT', primaryIsLight))
        .pipe(replace('SECONDARY_IS_LIGHT', secondaryIsLight))
        .pipe(replace('LIGHT_COLORS_PRIMARY', primaryIsLight ? `
        $navbar-font-color: $black !default;
        $collection-link-color: $darkgrey !default;
        ` : ''))
        .pipe(replace('LIGHT_COLORS_SECONDARY', secondaryIsLight ? `
        $button-raised-color: $black !default;
        $button-floating-color: $black !default;
        $collection-active-color: $black !default;
        $button-active-color: $black !default;
        $collection-link-color: $darkgrey !default;
        ` : '$link-color: $secondary-color !default;'))
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(processors))
        .pipe(rename(`materialize-${primaryColor}-${secondaryColor}.css`))
        .pipe(gulp.dest('dist/css'));
    });
  }).reduce((themes, colorThemes) => {
    return themes.concat(colorThemes);
  }, []);

  return merge(...themes);
});

gulp.task('sass:min', ['sass:expanded'], function() {
  var themes = primaryColors.map(primaryColor => {
    return secondaryColors.map(secondaryColor => {
      return gulp.src(`dist/css/materialize-${primaryColor}-${secondaryColor}.css`)
        .pipe(cleanCSS({compatibility: 'ie10'}))
        .pipe(rename(`materialize-${primaryColor}-${secondaryColor}.min.css`))
        .pipe(gulp.dest('dist/css'));
    });
  }).reduce((themes, colorThemes) => {
    return themes.concat(colorThemes);
  }, []);

  return merge(...themes);
});

gulp.task('default', ['clean', 'copy', 'sass:expanded', 'sass:min']);
