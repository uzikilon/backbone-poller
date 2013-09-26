/*global module, process */
/* jshint maxstatements: 15 */
module.exports = function (grunt) {


  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

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
          vendor: [
            'test/lib/jquery-1.8.2.js',
            'test/lib/underscore.js',
            'test/lib/backbone.js',
            'test/lib/sinon-1.5.2.js'
          ],
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