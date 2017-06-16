var gulp = require('gulp');
var _ = require('underscore');
var globby = require('globby');
var wrap = require('gulp-wrap');
var watchify = require('watchify');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var nodeResolve = require('resolve');
var buffer = require('vinyl-buffer');
var declare = require('gulp-declare');
var browserify = require('browserify');
var browserSync = require('browser-sync');
var packageJson = require('./package.json');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var handlebars = require('gulp-handlebars');
var defineModule = require('gulp-define-module');
var injectVersion = require('gulp-inject-version');

function getNPMPackageIds() {
  return _.keys(packageJson.dependencies) || [];
}

gulp.task('browserSync', function() {
    browserSync = browserSync.create();
    browserSync.init({
        server: {
            baseDir: "./",
            routes: {
                '/resources': 'resources'
            },
            directory: true
        },
        startPath: "./examples"
   });
});

gulp.task('css', function() {
    gulp.src(['./src/**/*.css'])
        .pipe(sourcemaps.init())
        .pipe(concat('marionette.toolbox.css'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./dist'));
});

gulp.task('templates', function() {
    var wrapper = [
        '(function (root, factory) {',
        '   if (typeof define === \'function\' && define.amd) {',
        '       define([\'handlebars\'], function(Handlebars) {',
        '           return factory(root.Toolbox, Handlebars)',
        '       });',
        '   } else if (typeof exports === \'object\') {',
        '       module.exports = factory(root.Toolbox, require(\'handlebars\'));',
        '   } else {',
        '       factory(root.Toolbox, root.Handlebars);',
        '   }',
        '}(this, function (Toolbox, Handlebars) {',
        '   if(typeof Handlebars === "undefined") {',
        '       throw Error(\'Handlebars is not defined.\')',
        '   }',
        '   if(typeof Toolbox.templates !== "object") {',
        '       Toolbox.templates = {}',
        '   }',
        '   Toolbox.templates[\'<%= name %>\'] = <%= handlebars %>',
        '}))'
    ].join('\n');

    gulp.src('./src/**/*.hbs')
        .pipe(handlebars({
            handlebars: require('handlebars')
        }))
        .pipe(defineModule('plain', {
            require: {
                Handlebars: 'handlebars'
            },
            wrapper: wrapper
        }))
        .pipe(concat('templates.js'))
        .pipe(gulp.dest('./src/Core'));
});


gulp.task('scripts', function() {
    return gulp.src([
        './src/Core/Toolbox.js',
        './src/Core/templates.*js',
        './src/Utilities/*.js',
        './src/Core/Handlebars/*.js',
        './src/TreeView/Tree.js',
        './src/Core/View.js',
        './src/Core/CollectionView.js',
        './src/BaseForm/BaseField.js',
        './src/BaseForm/BaseForm.js',
        './src/UnorderedList/UnorderedList.js',
        './src/DropdownMenu/DropdownMenu.js',
        './src/TreeView/TreeViewNode.js',
        './src/TreeView/TreeView.js',
        './src/TreeView/DraggableTreeNode.js',
        './src/TreeView/DraggableTreeView.js',
        './src/**/*.js'
    ])
    .pipe(sourcemaps.init())
    .pipe(injectVersion({
        prepend: ''
    }))
    .pipe(concat('marionette.toolbox.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist'))
    .pipe(browserSync.reload({stream: true}));
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

gulp.task('watch', function() {
    gulp.watch('./src/**/*.css', ['css']).on('change', browserSync.reload);
    gulp.watch('./src/**/*.js', ['scripts']);
    gulp.watch('./src/**/*.hbs', ['templates', 'scripts']);
    gulp.watch('./examples/**/*.html').on('change', browserSync.reload);
});

gulp.task('default', ['browserSync', 'vendor', 'css', 'templates', 'scripts', 'watch']);
