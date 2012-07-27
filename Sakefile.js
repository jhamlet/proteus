/*globals desc, task, taskSync, file, directory, fileSync, FileList, CLOBBER, CLEAN, spit, slurp, log, sh */
var Path        = require("path"),
    FS          = require("fs"),
    existsSync  = FS.existsSync || Path.existsSync,
    authorInfo  = read("AUTHORS", "utf8").split("\n")[0],
    buildStart  = new Date(),
    readMeFiles = new FileList(),
    buildComplete
;

//---------------------------------------------------------------------------
// Defines the CLEAN file-list and the 'clean' task
//---------------------------------------------------------------------------
require("sake/clean");
//---------------------------------------------------------------------------
// Overall build tasks
//---------------------------------------------------------------------------
taskSync("pre-build", function (t) {
    log.info("Starting build at " + buildStart);
});

taskSync("build", ["pre-build"], function (t) {
    var delta;
    
    buildComplete = new Date();
    delta = buildComplete.getTime() - buildStart.getTime();
    
    log.info("Build complete at " + buildComplete);
    log.info(delta + " ms");
});
//---------------------------------------------------------------------------
// LICENSE
//---------------------------------------------------------------------------
if (((new Date()).getFullYear() < FS.statSync("LICENSE").mtime.getFullYear()) ||
    (FS.statSync("AUTHORS").mtime.getTime() > FS.statSync("LICENSE").mtime.getTime())
) {
    desc("Keep the LICENSE file up-to-date.");
    fileSync("LICENSE", function (t) {
        var year = new Date().getFullYear(),
            license = read(t.name, "utf8").split("\n")
        ;

        license[0] = "Copyright (c) " + year + " " + authorInfo;

        write(t.name, license.join("\n"), "utf8");
        log.info(t.name + " updated");
    });
}
//---------------------------------------------------------------------------
// README file
//---------------------------------------------------------------------------
readMeFiles.include(
    "README.tmpl", "package.json", "LICENSE", "AUTHORS", "Sakefile.*"
);

desc("Generate the README.md documentation");
fileSync("README.md", readMeFiles, function (t) {
    var ejs     = require("ejs"),
        pkgInfo = JSON.parse(slurp("package.json", "utf8")),
        tmpl    = ejs.compile(slurp(t.prerequisites[0], "utf8")),
        tmplParams = {
            pkg: pkgInfo,
            license: slurp("./LICENSE", "utf8"),
            usage: ""
        }
    ;
    
    spit(t.name, tmpl(tmplParams), "utf8");
    log.info("Update " + t.name);
});
CLEAN.include("README.md");
//---------------------------------------------------------------------------
// link up
//---------------------------------------------------------------------------
task("build", ["LICENSE", "README.md"]);
task("default", ["build"]);
