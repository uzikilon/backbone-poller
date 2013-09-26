/*global module */
module.exports = function (grunt) {

  var vendorLibs = [
    'test/lib/jquery-1.10.2.js',
    'test/lib/underscore.js',
    'test/lib/backbone.js',
    'test/lib/sinon-1.7.3.js'
  ];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    connect: {
      test: {
        port: 8000
      }
    },

    jshint: {
      options: {
        jshintrc: 'test/jshint.json'
      },
      all: 'backbone.poller.js'
    },

    jasmine: {
      poller: {
        src: ['backbone.poller.js'],
        options: {
          vendor: vendorLibs,
          specs: 'test/spec/**/*.js',
          junit: {
            path: 'build/junit'
          },
          template: require('grunt-template-jasmine-istanbul'),
          templateOptions: {
            coverage: 'build/coverage/coverage.json',
            report: 'build/coverage',
            thresholds: {
              lines: 95,
              statements: 95,
              branches: 90,
              functions: 95
            }
          }

        }
      },
      'poller-min': {
        src: ['backbone.poller.min.js'],
        options: {
          vendor: vendorLibs,
          specs: 'test/spec/**/*.js'
        }
      }
    },

    uglify: {
      poller: {
        options: {
          preserveComments: 'some'
        },
        files: {
          'backbone.poller.min.js': ['backbone.poller.js']
        }
      }
    },

    docco: {
      poller: {
        src: ['backbone.poller.js'],
        options: {
          output: 'docs'
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-docco');

  grunt.registerTask('default', ['jshint', 'uglify', 'jasmine']);

};