/**
 * Build / minify the project
 */
module.exports = new Promise((resolve, reject) => {

  const pjson = require('./package.json');
  const fs = require('fs');
  var resolved = 2;

  //Clear out any existing files in dist
  console.log('Clearing out dist/ Directory...');
  fs.readdir('dist', (err, files) => {
    if (err) throw err;
    var numFiles = files.length;
    if(!numFiles){
      return doBuild();
    }
    for (const file of files) {
      fs.unlink('dist/'+file, err => {
        if (err) throw err;
        if(!--numFiles){
          console.log('...dist/ Directory Cleared')
          doBuild();
        }
      });
    }
  });

  function doBuild(){
    console.log('Building distribution files...')

    //I couldn't get node-minify to work with gcc and JS6 imports, so I call GCC directly
    console.log('Minifying JS...');

    //First build a list of all JS files
    const inputs = new function(){
      const path = ['src/js'];
      const ret = [];
      const files = fs.readdirSync(path.join('/'));
      files.forEach(file => {
        path.push(file);
        const currentPath = path.join('/');
        var contents = fs.readFileSync(currentPath, 'utf8');
        ret.push({
          path: currentPath,
          src: contents
        });
        path.pop();
      });
      return ret;
    }

    //Compile inputs
    const ClosureCompiler = require('google-closure-compiler').jsCompiler;
    const closureCompiler = new ClosureCompiler({
      compilation_level: 'SIMPLE_OPTIMIZATIONS'
    });

    const compilerProcess = closureCompiler.run(inputs, (exitCode, stdOut, stdErr) => {
      //compilation complete
      if(stdErr) {
        return console.log(stdErr);
      }
      fs.writeFile('dist/t-popup-'+pjson.version+'-min.js', stdOut[0].src, function(err) {
        if(err) {
          reject(err);
          return console.log(err);
        }
        console.log('...JS Minified.');
        if(!(--resolved)){
          resolve();
        }
      });
    });

    // I couldn't get @imports working with node-minify so I call the platform directly
    console.log('Minifying CSS...');
    let CleanCSS = require('clean-css');
    new CleanCSS({
      inline: ['all'],
      level: 2
    }).minify(['src/css/t_popup.css'], function(error, output){
      if(output.errors.length){
        console.log(output.errors); // a list of errors raised
      }
      fs.writeFile('dist/t-popup-'+pjson.version+'-min.css', output.styles, function(err) {
        if(err) {
          reject(err);
          return console.log(err);
        }
        console.log('...CSS Minified.')
        if(!(--resolved)){
          resolve();
        }
      });
    });
  }
});
