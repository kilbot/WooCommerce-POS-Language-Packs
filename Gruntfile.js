module.exports = function(grunt) {

  // load all grunt tasks matching the `grunt-*` pattern
  require('load-grunt-tasks')(grunt);

  var locales = [
    'ar',
    'bs_BA',
    'ca',
    'cs_CZ',
    'da_DK',
    'de_DE',
    'de_CH',
    'el',
    'es_AR',
    'es_CL',
    'es_ES',
    'es_MX',
    'et',
    'fi',
    'fr_FR',
    'fr_CA',
    'hi_IN',
    'hr_HR',
    'hu_HU',
    'id_ID',
    'is_IS',
    'it_IT',
    'mk_MK',
    'nb_NO',
    'nl_BE',
    'nl_NL',
    'pl_PL',
    'pt_BR',
    'pt_PT',
    'ro_RO',
    'ru_RU',
    'sk_SK',
    'sl_SI',
    'sq',
    'sv_SE',
    'sw',
    'tr_TR',
    'vi',
    'zh_CN',
    'zh_TW'
  ];

  grunt.initConfig({

    clean: {
      mo: ['languages/**/*.mo'],
      po: ['languages/**/*.po~']
    },

    shell: {
      pullTx: {
        command: 'tx pull -a'
      }
    }

  });

  grunt.registerTask('msgmerge', 'Init or merge the po files for each locale', function () {

    var msgmerge = require('./grunt/msgmerge')(grunt);

    msgmerge.options = {
      locales: locales,
      cwd: 'languages/',
      pot: 'resources/'
    }

    var done = this.async();
    msgmerge.start(done);

  });

  grunt.registerTask('timestamp', 'Add timestamp to package.json', function () {

    var pkg = grunt.file.readJSON('package.json');

    pkg.locales = {};
    pkg.pro_locales = {};

    var latest = function(locale, slug){
      var po1 = 'languages/' + slug + '-' + locale + '.po';
      var po2 = 'languages/' + slug + '-admin-' + locale + '.po';

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
          cwd: 'languages',
          src: [
            slug + '-' + locale + '.po',
            slug + '-' + locale + '.mo',
            slug + '-admin-' + locale + '.po',
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

  grunt.registerTask('default', ['shell', 'msgmerge', 'timestamp', 'package', 'clean']);

};