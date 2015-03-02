module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      css: {
        src: [
          'src/css/*.css',
        ],
        dest: 'marionette.toolbox.css',
      },
      vendorCss: {
        src: [
          'src/css/vendor/*.css',
        ],
        dest: 'vendor.css',
      },
      vendor: {
        src: [
          'src/js/vendor/jquery.js',
          'src/js/vendor/json2.js',
          'src/js/vendor/handlebars.js',
          'src/js/vendor/underscore.js',
          'src/js/vendor/backbone.js',
          'src/js/vendor/backbone.babysitter.js',
          'src/js/vendor/backbone.interface.js',
          'src/js/vendor/backbone.marionette.js',
          'src/js/vendor/backbone.wreqr.js',
          'src/js/vendor/*.js',
        ],
        dest: 'vendor.js'
      },
      source: {
        src: [
          'src/js/templates.js',
          'src/js/helpers/*.js',
          'src/js/Core.js',
          'src/js/views/ItemView.js',
          'src/js/views/CollectionView.js',
          'src/js/views/CompositeView.js',
          'src/js/views/LayoutView.js',
          'src/js/views/*.js',
        ],
        dest: 'marionette.toolbox.js'
      }
    },
    handlebars: {
      all: {
          files: {
              'src/js/templates.js': [
                'src/templates/*.handlebars',
                'src/templates/**/*.handlebars',
              ]
          }
      },
    },
    uglify: {
      options: {
        mangle: false,
        compress: false,
        drop_console: true,
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'marionette.toolbox.min.js': 'marionette.toolbox.js'
        }
      }
    },
    cssmin: {
      app: {
        src: 'marionette.toolbox.css',
        dest: 'marionette.toolbox.min.css'
      }
    },
    watch: {
      options: {
        livereload: true
      },
      scripts: {
        files: ['<%= concat.source.src %>', '<%= concat.vendor.src %>'],
        tasks: ['concat'],
      },
      css: {
        files: ['<%= concat.css.src %>', '<%= concat.css.src %>'],
        tasks: ['concat'],
      },
      handlebars: {
        files: [
          'src/templates/*.handlebars',
          'src/templates/**/*.handlebars'
        ],
        tasks: ['handlebars', 'concat'],
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-handlebars-compiler');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // Default task(s).
  grunt.registerTask('default', ['handlebars', 'concat', 'cssmin', 'uglify', 'watch']);

};