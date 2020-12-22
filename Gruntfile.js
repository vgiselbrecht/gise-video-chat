'use strict';
module.exports = function(grunt) {

  grunt.initConfig({
    sass: {
      dist: {
        options: {
          style: 'compressed',
          compass: false,
          sourcemap: true
        },
        files: {
          'public_html/assets/css/main.min.css': [
              'public_html/assets/sass/main.scss'
          ]
        }
      }
    },
    ts: {
        default: {
          tsconfig: true,
          out: "public_html/assets/js/app.js",
          options: {
            allowJs: true
        }
      }
    },
    watch: {
      options: {
        livereload: true
      },
      sass: {
        files: [
          'public_html/assets/sass/**/*.scss'
        ],
        tasks: ['sass']
      },
      ts: {
         files: [
          'public_html/assets/ts/**/*.ts'
        ],
        tasks: ['ts'] 
      },
      html: {
        files: [
          '**/*.html'
        ]
      }
    },
    clean: {
      dist: [
        'public_html/assets/css/main.min.css',
        'public_html/assets/js/app.min.js'
      ]
    }
  });

  // Load tasks
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks("grunt-ts");

  // Register tasks
  grunt.registerTask('default', [
    'clean',
    'sass',
    'ts'
  ]);
  grunt.registerTask('dev', [
    'watch'
  ]);

};