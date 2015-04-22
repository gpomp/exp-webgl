var     gulp = require('gulp'),
        gulpif = require('gulp-if'),
        gutil = require('gulp-util'),
        connect = require('gulp-connect'),
        concat = require('gulp-concat'),
        watch = require('gulp-watch'),
        source = require('vinyl-source-stream'),
        browserify = require('browserify'),
        plumber = require('gulp-plumber'),
        iconfont = require('gulp-iconfont'),
        iconfontCss = require('gulp-iconfont-css'),
        less = require('gulp-less'),
        tsify = require('tsify'),
        streamify = require('gulp-streamify'),
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
        autoprefixer = require('gulp-autoprefixer'),
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

// Glyphs
var fontName = 'glyph';
gulp.task('font', function(){
    return gulp.src(config.app + 'assets/glyph/*.svg')
        .pipe(iconfontCss({
            fontName: fontName,
            path: 'node_modules/gulp-iconfont-css/templates/_icons.less',
            targetPath: '../../app/less/generated/glyph.less',
            fontPath: '../fonts/'
        }))
        .pipe(iconfont({
            fontName: fontName,
            normalize:true,
            fontHeight: 1001
        }))
        .pipe(gulp.dest(config.dist+'fonts/'));
});

gulp.task('less', function () {
    gulp.src(config.app + "less/main.less")
        .pipe(plumber())
        .pipe(less().on('error', gutil.log))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
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
                        .pipe(gulpif(config.env === 'prod', uglify({mangle: true, compress : {drop_console:true}})))
                        .pipe(gulpif(config.env === 'dev', sourcemaps.write('./typescript')))
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
        .pipe(gulpif(config.env === 'prod', streamify(uglify({mangle: true, compress : {drop_console:true}}))))
        .pipe(gulp.dest(config.dist + 'js/'));
});

gulp.task('base-js', function() {
    runSequence(['base-code', 'base-includes']);
});

gulp.task('handlebars', function() {
    var options = {
        ignorePartials: true,
        batch : [config.app + 'handlebars/partials'],
        helpers : {
            ifCond: function(v1, v2, options) {
              if(v1 === v2) {
                return options.fn(this);
              }
              return options.inverse(this);
}
            }
    }

    var templateData = { template: '' };

    gulp.src(config.app + 'handlebars/*.handlebars')
    	.pipe(data(function(file) {
            var name = path.basename(file.path, '.handlebars');
            templateData.template = file.filename = name;
            
	 	}))
        .pipe(handlebars(templateData, options))
		.pipe(rename(function (path) {
            path.basename = "index";
        	path.extname = ".html";
        }))
        .pipe(gulp.dest(function(file) {
            return config.dist + file.filename + "/";
        }));



    return gulp.src(config.app + 'handlebars/*.handlebars')
        .pipe(data(function(file) {
            var name = path.basename(file.path, '.handlebars');
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
                .pipe(gulpif(config.env === 'prod', streamify(uglify({mangle: true, compress : {drop_console:true}}))))
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
            tsResult.js.pipe(concat('experiment.js'))
                                .pipe(gulpif(config.env === 'prod', uglify({mangle: true, compress : {drop_console:true}})))
                                .pipe(gulpif(config.env === 'dev', sourcemaps.write('./typescript')))
                                .pipe(gulp.dest(config.dist + name + '/js/'));
        }));
});

gulp.task('watch', function () {

    // FONT
    gulp.watch(config.app + "assets/glyph/*.svg", ['font', 'less']);

    // LESS
    gulp.watch(config.app + "less/*.less", ['less']);
    gulp.watch(config.app + "less/**/*.less", ['handlebars']);
    
    // TYPESCRIPT
    gulp.watch([config.app + 'typescript/base/**/*.ts', config.app + 'typescript/base/*.ts', "!" + config.app + "typescript/base/LaunchSite.ts"], ['base-code']);
    gulp.watch([config.app + 'typescript/**/**/*.ts', 
                config.app + 'typescript/**/*.ts',
                config.app + 'shaders/**/*.glsl',                
                config.app + 'shaders/*.glsl',                
                "!" + config.app + 'typescript/base/**/*.ts', 
                "!" + config.app + 'typescript/base/*.ts'], ['handlebars']);

    gulp.watch([config.app + "typescript/base/LaunchSite.ts"], ['base-includes'])

    // HTML
    gulp.watch([config.app + 'handlebars/*.handlebars', config.app + 'handlebars/partials/*.handlebars'], ['handlebars']);
});

gulp.task('devconfig', function () {
    console.log('set env as dev...');
    config.env = 'dev';
});

gulp.task('common', function(callback) {
    runSequence( 'base-js', 'font', ['less', 'handlebars'] );
});

gulp.task('dev',['devconfig', 'common', 'connect', 'watch']);
gulp.task('default',['common']);