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
        rimraf = require('gulp-rimraf'),
        argv = require('yargs').argv;


var config = {
    'env': 'prod',
    'app': './app/',
    'dist': 'public/'
};


gulp.task('connect', function() {
  connect.server({
    root: 'public',
    host: '*'
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

// Compile base 3d typescript
gulp.task('base-3d-code', function() {
    var sourceTsFiles = [
        'typings/**/*.d.ts',
        'app/typescript/base3d/*.ts', 
        'app/typescript/base3d/**/*.ts',
        '!app/typescript/base3d/includes3d.ts'];

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

// Compile base 3d Browserify includes
gulp.task('base-3d-includes', function() {
    var bundler = browserify({  debug: true,
                                extensions: ['.ts', '.js']})
        .add([ './app/typescript/base3d/includes3d.ts' ])
        .plugin(tsify);

    return bundler.bundle()
        .pipe(source('vendors-3d.js'))
        .pipe(gulpif(config.env === 'prod', streamify(uglify({mangle: true, compress : {drop_console:true}}))))
        .pipe(gulp.dest(config.dist + 'js/'));
});

gulp.task('compileprojects', function() {
    var isCommonShader = argv.includeOnly;
    gulp.src(config.app + "handlebars/*.handlebars")
    .pipe(data(function(file) {
        argv.currentname = path.basename(file.path, '.handlebars');
        if(isCommonShader !== true) {
            runSequence(['localhandlebars', 'localless', 'localincludes', 'localtypescript']);
        } else {
            runSequence('localincludes');
        }
    }));

    argv.includeOnly = false;
});


// Compile project's html
gulp.task('localhandlebars', function() {
    var n = argv.currentname;
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

    console.log(config.app + "handlebars/" + n + '.handlebars');

    gulp.src(config.app + "handlebars/" + n + '.handlebars')
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
            return config.dist + n + "/";
        }));
            
});

// Compile project's less
gulp.task('localless', function() {

    var n = argv.currentname;

    console.log(config.app + "less/" + n + "/main.less");

    var dname = "";
    gulp.src(config.app + "less/" + n + "/main.less")
        .pipe(plumber())
        .pipe(less().on('error', gutil.log))
        .pipe(gulpif(config.env === 'prod', minifycss()))
        .pipe(gulp.dest(config.dist + n + "/css/"));
});

// Compile project's browserify includes
gulp.task('localincludes', function() {
    var n = argv.currentname;
    console.log("./typescript/" + n + "/includes.ts");

    var bundler = browserify({  debug: true, 
                        basedir: config.app,
                        extensions: ['.ts', '.js']})
        .add([ "./typescript/" + n + "/includes.ts" ])
        .plugin(tsify);

    bundler.bundle()
                .pipe(source('includes.js'))
                .pipe(gulpif(config.env === 'prod', streamify(uglify({mangle: true, compress : {drop_console:true}}))))
                .pipe(gulp.dest(config.dist + n + '/js/'));
});

 // Compile project's scripts
gulp.task('localtypescript', function() {
    var n = argv.currentname;
    console.log('app/typescript/' + n + '/*.ts');
    var sourceTsFiles = [
            'typings/**/*.d.ts',
            'app/typescript/definitions/*.d.ts',
            'app/typescript/definitions/**/*.d.ts',
            'app/typescript/' + n + '/*.ts', 
            '!app/typescript/' + n + '/includes.ts'];

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
                            .pipe(gulp.dest(config.dist + n + '/js/'));
});

gulp.task('watch', function () {

    // FONT
    gulp.watch(config.app + "assets/glyph/*.svg", ['font', 'less']);

    // Global
    gulp.watch(config.app + "less/*.less", ['less']);
    gulp.watch([config.app + "typescript/base3d/includes3d.ts"], ['base-3d-includes']);
    gulp.watch([config.app + 'typescript/base3d/**/*.ts', config.app + 'typescript/base3d/*.ts', "!" + config.app + "typescript/base3d/includes3d.ts"], ['base-3d-code']);

    // Less
    gulp.watch([config.app + "less/**/*.less", "!" + config.app + "less/generated/*.less"], function(obj) {

        argv.lesspath = obj.path;
        var p = path.dirname(obj.path).split(path.sep);
        argv.currentname = p[p.length - 1]; 

        runSequence('localless'); 
    });

    // GLSL (Browserify includes)
    gulp.watch([
        config.app + 'shaders/**/*.glsl'
    ], function(obj) {
        var p = path.dirname(obj.path).split(path.sep);
        argv.currentname = p[p.length - 2];

        // If common shader recompile all projects include
        if(argv.currentname === 'common') {
            argv.includeOnly = true;
            runSequence('compileprojects');
        } else {
            runSequence('localincludes'); 
        }
        
     });

    // Browserify includes
    gulp.watch([
        config.app + 'typescript/**/includes.ts', config.app + 'typescript/**/*.js'
    ], function(obj) {
        var p = path.dirname(obj.path).split(path.sep);
        argv.currentname = p[p.length - 1]; 

        runSequence('localincludes'); 
     });
    
    // TYPESCRIPT    
    gulp.watch([config.app + 'typescript/**/**/*.ts', 
                config.app + 'typescript/**/*.ts',
                "!" + config.app + 'typescript/**/includes.ts', 
                "!" + config.app + 'typescript/definitions/**/*.ts', 
                "!" + config.app + 'typescript/definitions/*.ts', 
                "!" + config.app + 'typescript/base3d/**/*.ts', 
                "!" + config.app + 'typescript/base3d/*.ts'], function(obj) {
                    var p = path.dirname(obj.path).split(path.sep);
                    argv.currentname = p[p.length - 1]; 
                    runSequence('localtypescript'); 
                });

    // HTML
    gulp.watch([config.app + 'handlebars/*.handlebars', config.app + 'handlebars/partials/*.handlebars'], function(obj) {
        var p = path.basename(obj.path, '.handlebars');
        argv.currentname = p; 
        runSequence('localhandlebars'); 
    });
});

gulp.task('devconfig', function () {
    console.log('set env as dev...');
    config.env = 'dev';
});

gulp.task('common', function(callback) {
    runSequence( 'base-3d-code', 'font', ['less', 'compileprojects'] );
});

gulp.task('dev',['devconfig', 'common', 'connect', 'watch']);
gulp.task('default', ['base-3d-includes', 'common']);