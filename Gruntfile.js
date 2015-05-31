module.exports = function(grunt) {

  // load all grunt tasks matching the `grunt-*` pattern
  require('load-grunt-tasks')(grunt);

  var locales = [
    'ar',
    'ca',
    'da_DK',
    'de_DE',
    'el',
    'es_ES',
    'fi',
    'fr_FR',
    'it_IT',
    'nb_NO',
    'nl_NL',
    'pt_BR',
    'pt_PT',
    'sv_SE',
    'zh_CN'
  ];

  grunt.initConfig({

    clean: {
      mo: ['languages/**/*.mo'],
      po: ['languages/**/*.po~']
    }

  });

  grunt.registerTask('msgmerge', 'Init or merge the po files for each locale', function () {

    var msgmerge = require('./grunt/msgmerge')(grunt);

    msgmerge.options = {
      locales: locales,
      cwd: 'languages/'
    }

    var done = this.async();
    msgmerge.start(done);

  });

  grunt.registerTask('timestamp', 'Add timestamp to package.json', function () {

    var pkg = grunt.file.readJSON('package.json');

    pkg.locales = {};
    pkg.pro_locales = {};

    var latest = function(locale, slug){
      var po1 = 'languages/' + locale + '/' + slug + '-' + locale + '.po';
      var po2 = 'languages/' + locale + '/' + slug + '-admin-' + locale + '.po';

      rev1 = grunt.file.read(po1).match(/"PO-Revision-Date: (.*)\\n"/);
      rev2 = grunt.file.read(po2).match(/"PO-Revision-Date: (.*)\\n"/);

      if(new Date(rev1[1]) > new Date(rev2[1])){
        return rev1[1];
      }
      return rev2[1];
    };

    locales.forEach(function(locale){
      pkg.locales[locale] = latest(locale, 'woocommerce-pos');
      pkg.pro_locales[locale] = latest(locale, 'woocommerce-pos-pro');
    });

    grunt.file.write('package.json', JSON.stringify(pkg, null, 2));

  });

  grunt.registerTask('package', 'Zip .mo files', function () {
    var compress = {};

    var options = function(locale, slug){
      return {
        options: { archive: 'packages/' + slug + '-' + locale + '.zip' },
        files: [{
          expand: true,
          cwd: 'languages/' + locale,
          src: [
            slug + '-' + locale + '.mo',
            slug + '-admin-' + locale + '.mo'
          ]
        }]
      }
    };

    locales.forEach(function(locale){
      compress[locale] = options(locale, 'woocommerce-pos');
      compress['pro-' + locale] = options(locale, 'woocommerce-pos-pro');
    });

    grunt.config('compress', compress);
    grunt.task.run('compress');

  });

  grunt.registerTask('default', ['msgmerge', 'timestamp', 'package', 'clean']);

};