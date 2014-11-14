module.exports = function(grunt) {

    // load all grunt tasks matching the `grunt-*` pattern
    require('load-grunt-tasks')(grunt);

    grunt.registerTask('default', 'Package translation files', function() {
        var packages = {},
            pkg = grunt.file.readJSON('package.json');

        pkg.locales = {};
        pkg.pro_locales = {};

        grunt.file.expand({ cwd: 'languages/' }, '*.po').forEach(function(po){
            var name = po.replace('.po', ''),
                match = name.match(/(.*)-(.*)/),
                slug = match[1].replace('-admin', ''),
                locale = match[2],
                package = slug + '-' + locale,
                date = grunt.file.read('languages/' + po).match(/"PO-Revision-Date: (.*)\\n"/);

            if( slug === 'woocommerce-pos' ){
                if( pkg.locales.hasOwnProperty( locale ) ){
                    var d1 = new Date(pkg.locales[locale]);
                    var d2 = new Date(date[1]);
                    if( d1 < d2 ) {
                        pkg.locales[locale] = date[1];
                    }
                } else {
                    pkg.locales[locale] = date[1];
                }
            } else if( slug === 'woocommerce-pos-pro' ) {
                if( pkg.pro_locales.hasOwnProperty( locale ) ){
                    var d1 = new Date(pkg.locales[locale]);
                    var d2 = new Date(date[1]);
                    if( d1 < d2 ) {
                        pkg.pro_locales[locale] = date[1];
                    }
                } else {
                    pkg.pro_locales[locale] = date[1];
                }
            }

            if( packages.hasOwnProperty( package ) ){
                packages[package].files[0].src.push( po, name + '.mo' );
            } else {
                packages[package] = {
                    options: {
                        archive: 'packages/' + package + '.zip'
                    },
                    files: [
                        {
                            expand: true,
                            cwd: 'languages/',
                            src: [ po, name + '.mo' ]
                        }
                    ]
                }
            }
        });

        grunt.config('po2mo.files', { src: 'languages/*.po', expand: true });
        grunt.config('compress', packages );
        grunt.config('clean', ['languages/*.mo']);

        grunt.task.run('po2mo');
        grunt.task.run('compress');
        grunt.task.run('clean');

        grunt.file.write('package.json', JSON.stringify(pkg, null, 2));

    });

};