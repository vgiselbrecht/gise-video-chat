'use strict';

const path = require('path');

module.exports = function(grunt) {

  var chatConfig = grunt.file.readJSON("./src/config.json");

  grunt.initConfig({
    webpack: {
      myconfig: {
        mode: grunt.option('target') || 'development', 
        devtool: 'source-map',
        entry: "./src/assets/ts/app.ts",
        module: {
          rules: [
            {
              test: /\.tsx?$/,
              use: 'ts-loader',
              exclude: /node_modules/,
            },
            {
              test: /\.s[ac]ss$/i,
              use: [
                "style-loader",
                {
                  loader: 'css-loader',
                  options: {
                    sourceMap: true,
                  }
                },
                {
                  loader: 'sass-loader',
                  options: {
                    sourceMap: true,
                    sassOptions:{
                      outputStyle: 'compressed'
                    }
                  }
                }
              ],
            },
            {
              test: /\.(eot|svg|ttf|woff|woff2|png|jpg|jpeg)$/i,
              use: [
                {
                  loader: 'url-loader',
                  options: {
                    limit: 8192
                  }
                }
              ]
            },
            {
              test: /(chat\.png|\.mp3)$/,
              use: 'file-loader?name=[name].[ext]',
            },
          ],
        },
        resolve: {
          extensions: [ '.tsx', '.ts', '.js' ],
        },
        output: {
          path: path.resolve(__dirname, 'dist/assets'),
          filename: "bundle.js"
        },
        performance: {
          hints: false 
        }
      },
    },
    replace: {
      dist: {
        options: {
          patterns: [
            {
              match: 'version',
              replacement: new Date().getTime()
            },
            {
              match: 'title',
              replacement: chatConfig.meta.title ?? ""
            },
            {
              match: 'description',
              replacement: chatConfig.meta.description ?? ""
            },
            {
              match: 'keywords',
              replacement: chatConfig.meta.keywords ?? ""
            }
            ,
            {
              match: 'image',
              replacement: chatConfig.meta.image ?? ""
            }
          ]
        },
        files: [
          {src: ['src/index.html'], dest: 'dist/index.html'}
        ]
      }
    },
    watch: {
      options: {
        livereload: true
      },
      sass: {
        files: [
          'src/assets/sass/**/*.scss'
        ],
        tasks: ['webpack']
      },
      ts: {
         files: [
          'src/assets/ts/**/*.ts',
          'src/assets/translations/*.js',
          'src/config.json',
          'package.json'
        ],
        tasks: ['webpack'] 
      },
      html: {
        files: [
          'src/index.html',
          'src/config.json'
        ],
        tasks: ['replace'] 
      }
    },
    clean: ['dist']
  });

  // Load tasks
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-replace');

  // Register tasks
  grunt.registerTask('default', [
    'clean',
    'webpack',
    'replace'
  ]);

  grunt.registerTask('deploy', [
    'clean',
    'webpack',
    'replace'
  ]);

};