// Global frontend gulfile setup
// load and declare the toolset
import gulp from 'gulp'
import gulpLoadPlugins from 'gulp-load-plugins'
import del from 'del'
import babelify from 'babelify'
import browserify from 'browserify'
import source from 'vinyl-source-stream'
import buffer from 'vinyl-buffer'
const gutil = require('gulp-util')
const wait = require('gulp-wait')
const $ = gulpLoadPlugins()

// path declarations
const project = './resources/frontend'
const scss = project + '/scss'
const js = project + '/js'
// const assets = project + '/assets'
const dist = './public/dist'
// Edge template paths
const templates = './resources/views/**/*.njk'

// Remove existing docs and dist build
gulp.task('clean', del.bind(null, [dist, 'dist']))
gulp.task('cleanJs', del.bind(null, [dist + '/js/app.min.js']))
gulp.task('cleanCss', del.bind(null, [dist + '/css']))

// Build SCSS
gulp.task('styles', ['cleanCss'], () => {
  gulp.src([
    scss + '/app.scss'
  ])
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      includePaths: ['node_modules']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['last 2 versions']}))
    .pipe($.rename({suffix: '.min'}))
    .pipe(gulp.dest(dist + '/css'))
    .pipe($.minifyCss())
    .pipe($.concat('app.min.css'))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(dist + '/css'))
    .pipe(wait(100))
    .pipe($.livereload())
})

gulp.task('scripts', ['cleanJs'], () => {
  let b = browserify({
    entries: js + '/app.js',
    transform: [babelify.configure({
      presets: ['es2015']
    })]
  })

  return b.bundle()
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe($.sourcemaps.init({loadMaps: true}))
    // Add transformation tasks to the pipeline here.
    .pipe($.uglify())
    .pipe($.rename({suffix: '.min'}))
    .on('error', gutil.log)
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(dist + '/js'))
    .pipe(wait(100))
    .pipe($.livereload())
})

// Watch for template changes
gulp.task('templates', () => {
  gulp.src([
    templates
  ])
    .pipe(wait(100))
    .pipe($.livereload())
})

// Build once and then watch for changes only on project's sources not third party
gulp.task('watch', ['styles', 'scripts'], () => {
  $.livereload.listen()
  gulp.watch(templates, ['templates'])
  gulp.watch(scss + '/**/*.scss', ['styles'])
  gulp.watch(js + '/**/*.js', ['scripts'])
})

gulp.task('dist', ['styles', 'scripts'])

gulp.task('default', ['clean'], () => {
  gulp.start('dist')
})
