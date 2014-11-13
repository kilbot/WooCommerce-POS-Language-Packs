module.exports = function(grunt) {

    // load all grunt tasks matching the `grunt-*` pattern
    require('load-grunt-tasks')(grunt);

    grunt.registerTask('default', 'Package translation files', function() {
        var pkg = grunt.file.readJSON('package.json');
        pkg.locales = {};

        grunt.config('po2mo.files', { src: 'languages/*.po', expand: true });

        grunt.file.expand({ cwd: 'languages/' }, '*.po').forEach(function(po){
            var name = po.replace('.po', '');
            var locale = name.replace('woocommerce-pos-', '');
            var date = grunt.file.read('languages/' + po).match(/"PO-Revision-Date: (.*)\\n"/);
            pkg.locales[locale] = date[1];

            grunt.config('compress.' + name, {
                options: {
                    archive: 'packages/' + locale + '.zip'
                },
                files: [
                    {
                        expand: true,
                        cwd: 'languages/',
                        src: [ po, name + '.mo' ]
                    }
                ]
            });
        });

        grunt.task.run('po2mo');
        grunt.task.run('compress');

        grunt.file.write('package.json', JSON.stringify(pkg, null, 2));

    });

};