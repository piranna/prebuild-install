var test = require('tape')
var path = require('path')
var exec = require('child_process').exec
var xtend = require('xtend')

test('custom config and aliases', function (t) {
  var args = [
    '--arch ARCH',
    '--platform PLATFORM',
    '--download https://foo.bar',
    '--debug',
    '--version',
    '--help',
    '--path ../some/other/path',
    '--no-prebuild'
  ]
  runRc(t, args.join(' '), {}, function (rc) {
    t.equal(rc.arch, 'ARCH', 'correct arch')
    t.equal(rc.arch, rc.a, 'arch alias')
    t.equal(rc.platform, 'PLATFORM', 'correct platform')
    t.equal(rc.download, 'https://foo.bar', 'download is set')
    t.equal(rc.download, rc.d, 'download alias')
    t.equal(rc.debug, true, 'debug is set')
    t.equal(rc.version, true, 'version is set')
    t.equal(rc.version, rc.v, 'version alias')
    t.equal(rc.help, true, 'help is set')
    t.equal(rc.help, rc.h, 'help alias')
    t.equal(rc.path, '../some/other/path', 'correct path')
    t.equal(rc.path, rc.p, 'path alias')
    t.equal(rc.prebuild, false, 'correct --no-prebuild')
    t.end()
  })
})

test('npm args are passed on from npm environment into rc', function (t) {
  var env = {
    npm_config_argv: JSON.stringify({
      cooked: [
        '--debug',
        '--no-prebuild'
      ]
    })
  }
  runRc(t, '', env, function (rc) {
    t.equal(rc.debug, true, 'debug should be true')
    t.equal(rc.prebuild, false, 'prebuild should be false')
    t.end()
  })
})

test('npm_config_* are passed on from environment into rc', function (t) {
  var env = {
    npm_config_proxy: 'PROXY',
    npm_config_https_proxy: 'HTTPS_PROXY',
    npm_config_local_address: 'LOCAL_ADDRESS'
  }
  runRc(t, '', env, function (rc) {
    t.equal(rc.proxy, 'PROXY', 'proxy is set')
    t.equal(rc['https-proxy'], 'HTTPS_PROXY', 'https-proxy is set')
    t.equal(rc['local-address'], 'LOCAL_ADDRESS', 'local-address is set')
    t.end()
  })
})

function runRc (t, args, env, cb) {
  var cmd = 'node ' + path.resolve(__dirname, '..', 'rc.js') + ' ' + args
  env = xtend(process.env, env)
  exec(cmd, { env: env }, function (err, stdout, stderr) {
    t.error(err, 'no error')
    t.equal(stderr.length, 0, 'no stderr')
    var result
    try {
      result = JSON.parse(stdout.toString())
      t.pass('json parsed correctly')
    } catch (e) {
      t.fail(e.message)
    }
    cb(result)
  })
}
