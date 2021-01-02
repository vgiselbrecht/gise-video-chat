'use strict';

const path = require('path');

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
    webpack: {
      myconfig: {
        mode: "none",
        devtool: 'source-map',
        entry: "./public_html/assets/ts/app.ts",
        module: {
          rules: [
            {
              test: /\.tsx?$/,
              use: 'ts-loader',
              exclude: /node_modules/,
            },
          ],
        },
        resolve: {
          extensions: [ '.tsx', '.ts', '.js' ],
        },
        output: {
          path: path.resolve(__dirname, 'public_html/assets/js'),
          filename: "bundle.js"
        },
      },
    },
    replace: {
      dist: {
        options: {
          patterns: [
            {
              match: 'version',
              replacement: new Date().getTime()
            }
          ]
        },
        files: [
          {src: ['public_html/index.tmp.html'], dest: 'public_html/index.html'}
        ]
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
        tasks: ['webpack'] 
      },
      html: {
        files: [
          'public_html/index.tmp.html'
        ],
        tasks: ['replace'] 
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
  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-replace');

  // Register tasks
  grunt.registerTask('default', [
    'clean',
    'sass',
    'webpack',
    'replace'
  ]);
  grunt.registerTask('dev', [
    'watch'
  ]);

};