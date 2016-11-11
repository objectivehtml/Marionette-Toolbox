var packageJson = require('./package.json');
var gulp = require('gulp');
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

gulp.task('templates', function() {

    var wrapper = [
        '(function (root, factory) {',
            'if (typeof exports === \'object\') {',
                'module.exports = factory(require(\'handlebars\'));',
            '} else if (typeof define === \'function\' && define.amd) {',
                'define([\'handlebars\'], factory);',
            '} else {',
                'root.HandlebarsHelpersRegistry = factory(root.Handlebars);',
            '}',
        '}(this, function (Handlebars) {',
            'if(!Handlebars) {',
                'throw Error("Handlebars dependency cannot be found.");',
            '}',
            'if(typeof Handlebars.templates !== "object") {',
                'Handlebars.templates = {};',
            '}',
            'Handlebars.templates[\'<%= name %>\'] = <%= handlebars %>',
        '}))'
    ].join('');

    gulp.src(['./src/templates/**/*.handlebars'])
        .pipe(handlebars())
        .pipe(defineModule('plain', {
            require: {Handlebars: 'handlebars'},
            wrapper: wrapper
        }))
        .pipe(concat('templates.js'))
        .pipe(gulp.dest('./src'));
});

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

gulp.task('scripts', function() {
    var files = [
        './src/templates.js',
        './src/js/Core.js',
        './src/js/views/ItemView.js',
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
        .pipe(concat('marionette.toolbox.js'))
        .pipe(gulp.dest('./dist'));
});

var dependencies = Object.keys(packageJson && packageJson.dependencies || {});

/*
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
*/

gulp.task('browserify', function () {
    return;

    var bundler, files = [
        './src/js/Core.js',
        './src/js/views/ActivityIndicator.js',
    ];

    globby(files).then(function(entries) {
        function bundle() {
            return bundler
                .external(dependencies)
                .bundle()
            /*
                .on('error', function (err) {
                    gutil.log(err.message);
                    browserSync.notify("Browserify Error!");
                    this.emit("end");
                })
                */
                .pipe(source('marionette.toolbox.js'))
                .pipe(buffer())
                // .pipe(uglify())
                .pipe(gulp.dest('./dist/'))
                //.pipe(browserSync.reload({stream:true}));
        }

        var bundler = browserify(entries, {
            cache: {},
            packageCache: {},
            paths: ['./resources/assets/js/'],
            debug: true
        });

        getNPMPackageIds().forEach(function (id) {
            bundler.external(id);
        });

        bundler.on('update', bundle);

        bundle();
    });
});

gulp.task('vendor', function() {
    var files = [
        './src/vendor/jquery.js',
        './src/vendor/underscore.js',
        './src/vendor/backbone.js',
        './src/vendor/backbone.babysitter.js',
        './src/vendor/backbone.wreqr.js',
        './src/vendor/backbone.marionette.js',
        './src/vendor/handlebars.js',
        './src/vendor/*.js'
    ];

    gulp.src(files)
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest('./resources'))
        .pipe(rename('vendor.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./resources'));
});

gulp.task('default', ['css', 'templates', 'scripts', 'vendor']);
