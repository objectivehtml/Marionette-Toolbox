var packageJson = require('./package.json');
var gulp = require('gulp');
var injectVersion = require('gulp-inject-version');
var browserify = require('browserify');
var watchify = require('watchify');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var handlebars = require('gulp-handlebars');
var defineModule = require('gulp-define-module');
var browserSync = require('browser-sync');
var globby = require('globby');
var nodeResolve = require('resolve');
var _ = require('underscore');

function getNPMPackageIds() {
  return _.keys(packageJson.dependencies) || [];
}

gulp.task('browserSync', function() {
    browserSync = browserSync.create();
    browserSync.init({
       server: {
           baseDir: "./src"
       }
   });
});

gulp.task('css', function() {
    gulp.src(['./src/css/**/*.css'])
        .pipe(concat('marionette.toolbox.css'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('templates', function() {
    var wrapper = [
        '(function (root, factory) {',
            'if (typeof define === \'function\' && define.amd) {',
                'define([\'handlebars\'], function(Handlebars) {',
                    'return factory(root.Toolbox, Handlebars)',
                '});',
            '} else if (typeof exports === \'object\') {',
                'module.exports = factory(root.Toolbox, require(\'handlebars\'));',
            '} else {',
                'factory(root.Toolbox, root.Handlebars);',
            '}',
        '}(this, function (Toolbox, Handlebars) {',
            'if(typeof Toolbox === "undefined") {',
                'throw Error(\'Handlebars is not defined.\')',
            '}',
            'if(typeof Toolbox.templates !== "object") {',
                'Toolbox.templates = {}',
            '}',
            'Toolbox.templates[\'<%= name %>\'] = <%= handlebars %>',
        '}))'
    ].join('');

    gulp.src(['./src/templates/**/*.handlebars'])
        .pipe(handlebars())
        .pipe(defineModule('plain', {
            require: {
                Handlebars: 'handlebars'
            },
            wrapper: wrapper
        }))
        .pipe(concat('templates.js'))
        .pipe(gulp.dest('./src'));
});

gulp.task('scripts', function() {
    var files = [
        './src/js/Core/Toolbox.js',
        './src/Helpers/*.js',
        './src/templates.*js',
        './src/js/Views/ItemView.js',
        './src/js/views/LayoutView.js',
        './src/js/views/CompositeView.js',
        './src/js/views/CollectionView.js',
        './src/js/views/BaseField.js',
        './src/js/views/BaseForm.js',
        './src/js/views/DropdownMenu.js',
        './src/js/views/ButtonDropdownMenu.js',
        './src/js/**/*.js'
    ];

    gulp.src(files)
        .pipe(injectVersion({
            prepend: ''
        }))
        .pipe(concat('marionette.toolbox.js'))
        .pipe(gulp.dest('./dist'));
});

var dependencies = Object.keys(packageJson && packageJson.dependencies || {});

gulp.task('vendor', function () {
    var bundler = browserify({
        debug: true
    });

    getNPMPackageIds().forEach(function (id) {
        bundler.require(nodeResolve.sync(id), { expose: id });
    });

    bundler.bundle()
        .pipe(source('vendor.js'))
        .pipe(gulp.dest('./resources'));
});

gulp.task('default', ['vendor', 'css', 'templates', 'scripts']);
