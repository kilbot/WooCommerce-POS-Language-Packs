module.exports = function(grunt) {

    // load all grunt tasks matching the `grunt-*` pattern
    require('load-grunt-tasks')(grunt);

    grunt.registerTask('default', 'Package po & mo files', function() {
        var locales = [];

        grunt.config('po2mo.files', { src: 'languages/*.po', expand: true});

        grunt.file.expand({ cwd: 'languages/' }, '*.po').forEach(function(po){
            var name = po.replace('.po', '');
            locales.push( name.replace('woocommerce-pos-', '') );

            grunt.config('compress.' + name, {
                options: {
                    archive: 'packages/' + name + '.zip'
                },
                files: [
                    {
                        expand: true,
                        cwd: 'languages/',
                        src: [ po, name + '.mo' ],
                        dest: name
                    }
                ]
            });
        });

        grunt.task.run('po2mo');
        grunt.task.run('compress');

        var pkg = grunt.file.readJSON('package.json');
        pkg.locales = locales;
        grunt.file.write('package.json', JSON.stringify(pkg, null, 2));

    });

};