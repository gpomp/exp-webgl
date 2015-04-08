var     gulp = require('gulp'),
        gulpif = require('gulp-if'),
        gutil = require('gulp-util'),
        connect = require('gulp-connect'),
        concat = require('gulp-concat'),
        watch = require('gulp-watch'),
        source = require('vinyl-source-stream'),
        browserify = require('browserify'),
        plumber = require('gulp-plumber'),
        less = require('gulp-less'),
        tsify = require('tsify'),
        tsc = require('gulp-typescript'),
        sourcemaps = require('gulp-sourcemaps'),
        uglify = require('gulp-uglify'),
        minifycss = require('gulp-minify-css'),
        handlebars = require('gulp-compile-handlebars'),
        rename = require('gulp-rename'),
        data = require('gulp-data'),
        path = require('path')
        del = require('del'), 
        debug = require('gulp-debug'),
        insert = require('gulp-insert'),
        runSequence = require('run-sequence').use(gulp),
        rimraf = require('gulp-rimraf');


var config = {
    'env': 'prod',
    'app': './app/',
    'dist': 'public/',
    'bower' : 'app/vendor/'
};


gulp.task('connect', function() {
  connect.server({
    root: 'public',
    livereload: true,
    host: '0.0.0.0'
  });
});

gulp.task('less', function () {
    gulp.src(config.app + "less/main.less")
        .pipe(plumber())
        .pipe(less().on('error', gutil.log))
        .pipe(gulpif(config.env === 'prod', minifycss()))
        .pipe(gulp.dest(config.dist + "css"));
});

// Compile base typescript
gulp.task('base-code', function() {
    var sourceTsFiles = [
        'typings/**/*.d.ts',
        'app/typescript/base/*.ts', 
        'app/typescript/base/**/*.ts',
        '!app/typescript/base/LaunchSite.ts'];

    var tsResult = gulp.src(sourceTsFiles)
                       .pipe(sourcemaps.init())
                       .pipe(tsc({
                           target: 'ES5',
                           declarationFiles: true,
                           noExternalResolve: true
                       }));

    tsResult.dts.pipe(gulp.dest(config.app + 'typescript/definitions/'));
    return tsResult.js.pipe(concat('base-3d.js'))
                        .pipe(sourcemaps.write('./typescript'))
                        .pipe(gulp.dest(config.dist + 'js/'));
});

// Compile base Browserify includes
gulp.task('base-includes', function() {
    var bundler = browserify({  debug: true,
                                extensions: ['.ts', '.js']})
        .add([ './app/typescript/base/LaunchSite.ts' ])
        .plugin(tsify);

    return bundler.bundle()
        .pipe(source('global-vendors.js'))
        .pipe(plumber())
        .pipe(gulp.dest(config.dist + 'js/'));
});

gulp.task('base-js', function() {
    runSequence(['base-code', 'base-includes']);
});

gulp.task('handlebars', function() {
    var options = {
        ignorePartials: true,
        batch : [config.app + 'handlebars/partials']
    }

    var templateData = { template: '' };

    return gulp.src(config.app + 'handlebars/*.handlebars')
    	.pipe(data(function(file) {
            var name = path.basename(file.path, '.handlebars');
            templateData.template = name;

            // Compile corresponding less
            gulp.src(config.app + "less/" + name + "/main.less")
                .pipe(plumber())
                .pipe(less().on('error', gutil.log))
                .pipe(gulpif(config.env === 'prod', minifycss()))
                .pipe(gulp.dest(config.dist + name + "/css/"));

            // Compile local browserify includes
            var bundler = browserify({  debug: true, 
                            basedir: config.app,
                            extensions: ['.ts', '.js']})
            .add([ './typescript/' + name + '/includes.ts' ])
            .plugin(tsify);

            bundler.bundle()
                .pipe(source('includes.js'))
                .pipe(plumber())
                .pipe(gulp.dest(config.dist + name + '/js/'));

            // Compile local scripts
            var sourceTsFiles = [
                'typings/**/*.d.ts',
                'app/typescript/definitions/*.d.ts',
                'app/typescript/definitions/**/*.d.ts',
                'app/typescript/' + name + '/*.ts', 
                '!app/typescript/' + name + '/includes.ts'];

            var tsResult = gulp.src(sourceTsFiles)
                               .pipe(sourcemaps.init())
                               .pipe(tsc({
                                   target: 'ES5',
                                   declarationFiles: false,
                                   noExternalResolve: true
                               }));

            tsResult.dts.pipe(gulp.dest(config.dist + 'js/'));
            return tsResult.js.pipe(concat('experiment.js'))
                                .pipe(sourcemaps.write('./typescript'))
                                .pipe(gulp.dest(config.dist + name + '/js/'));
	 	}))
        
		.pipe(handlebars(templateData, options))
		.pipe(rename(function (path) {
            path.basename = "index";
        	path.extname = ".html";
        }))
        .pipe(gulp.dest(function(file) {
            return config.dist + templateData.template + "/";
        }));
});

gulp.task('watch', function () {
    // LESS
    gulp.watch(config.app + "less/*.less", ['less']);
    gulp.watch(config.app + "less/**/*.less", ['handlebars']);
    
    // TYPESCRIPT
    gulp.watch([config.app + 'typescript/base/**/*.ts', config.app + 'typescript/base/*.ts'], ['base-code']);
    gulp.watch([config.app + 'typescript/**/**/*.ts', 
                config.app + 'typescript/**/*.ts',
                config.app + 'shaders/**/*.glsl',                
                config.app + 'shaders/*.glsl',                
                "!" + config.app + 'typescript/base/**/*.ts', 
                "!" + config.app + 'typescript/base/*.ts'], ['handlebars']);

    // HTML
    gulp.watch([config.app + 'handlebars/*.handlebars', config.app + 'handlebars/partials/*.handlebars'], ['handlebars']);
});

gulp.task('devconfig', function () {
    console.log('set env as dev...');
    config.env = 'dev';
});

gulp.task('common', function(callback) {
    runSequence( 'base-js', ['less', 'handlebars'] );
});

gulp.task('dev',['devconfig', 'common', 'connect', 'watch']);
gulp.task('default',['common']);