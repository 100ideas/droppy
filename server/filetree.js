"use strict";

const filetree = module.exports = new (require("events").EventEmitter)();

const debounce = require("lodash.debounce");
const cloneDeep = require("fast-clone");
const chokidar = require("chokidar");
const escRe = require("escape-string-regexp");
const fs = require("graceful-fs");
const path = require("path");
const rrdir = require("rrdir");
const util = require("util");

const log = require("./log.js");
const paths = require("./paths.js").get();
const utils = require("./utils.js");

const lstat = util.promisify(fs.lstat);

let dirs = {};
let todoDirs = [];
let initial = true;
let watching = true;
let timer = null;
let cfg = null;
let updated = {}

const WATCHER_DELAY = 3000;

filetree.init = function(config) {
  cfg = config;
};

filetree.watch = function() {
  chokidar.watch(paths.files, {
    alwaysStat    : true,
    ignoreInitial : true,
    usePolling    : Boolean(cfg.pollingInterval),
    // useFsEvents   : true  // supersedes polling on macos - defaults to true if not set
    // awaitWriteFinish : true  // poll file size and only emit events when it is stable for some time
    interval      : cfg.pollingInterval,
    binaryInterval: cfg.pollingInterval
  }).on("error", log.error).on("all", (event, path, stats) => {
    // TODO: only update what's really necessary
    if (watching) {
      filetree.updateAll();
      filetree.emit("chokidar", {event, path: utils.removeFilesPath(path), fullpath: path, stats})
    }
  });
};

filetree.updateAll = debounce(() => {
  log.debug("Updating file tree because of local filesystem changes");
  updated = dirs
  filetree.updateDir(null, () => {
    filetree.emit("updateall");
  });
}, WATCHER_DELAY);

function lookAway() {
  watching = false;
  clearTimeout(timer);
  timer = setTimeout(() => {
    watching = true;
  }, WATCHER_DELAY);
}

function filterDirs(dirs) {
  return dirs.sort((a, b) => {
    return utils.countOccurences(a, "/") - utils.countOccurences(b, "/");
  }).filter((path, _, self) => {
    return self.every(another => {
      return another === path || path.indexOf(another + "/") !== 0;
    });
  }).filter((path, index, self) => {
    return self.indexOf(path) === index;
  });
}

const debouncedUpdate = debounce(() => {
  filterDirs(todoDirs).forEach(dir => {
    filetree.emit("update", dir);
  });
  todoDirs = [];
}, 100, {trailing: true});

function update(dir) {
  updateDirSizes();
  todoDirs.push(dir);
  debouncedUpdate();
}

filetree.updateDir = async function(dir) {
  if (dir === null) {
    dir = "/";
    dirs = {};
  }

  const fullDir = utils.addFilesPath(dir);

  let stats;
  try {
    stats = await lstat(fullDir);
  } catch (err) {
    log.error(err);
  }

  let entries = [];
  if (initial) { // sync walk for performance
    initial = false;
    try {
      entries = rrdir.sync(fullDir, {stats: true, exclude: cfg.ignorePatterns});
    } catch (err) {
      log.error(err);
    }
  } else {
    try {
      entries = await rrdir(fullDir, {stats: true, exclude: cfg.ignorePatterns});
    } catch (err) {
      log.error(err);
    }
  }

  for (const entry of (entries || [])) {
    if (entry.err) {
      if (entry.err.code === "ENOENT" && dirs[utils.removeFilesPath(entry.path)]) {
        delete dirs[utils.removeFilesPath(entry.path)];
      }
    }
  }

  //hack
  // console.log(`filetree.js::updateDir() entries (initial=${initial})`, entries)

  const readDirs = entries.filter(entry => entry.directory);
  const readFiles = entries.filter(entry => !entry.directory);

  updateDirInCache(dir, stats, readDirs, readFiles);
};

function updateDirInCache(root, stat, readDirs, readFiles) {
  dirs[root] = {files: {}, size: 0, mtime: stat ? stat.mtime.getTime() : Date.now()};

  const readDirObj = {}, readDirKeys = [];
  readDirs.sort((a, b) => utils.naturalSort(a.path, b.path)).forEach(d => {
    const path = normalize(utils.removeFilesPath(d.path));
    readDirObj[path] = d.stats;
    readDirKeys[path] = path;
  });

  // Remove deleted dirs
  Object.keys(dirs).forEach(path => {
    if (path.indexOf(root) === 0 && readDirKeys.includes(path) && path !== root) {
      delete dirs[path];
    }
  });

  let _updated = {}

  // Add dirs
  Object.keys(readDirObj).forEach(path => {
    let oldmtime = (updated[path] && updated[path].mtime) ? updated[path].mtime : 0
    let newmtime = readDirObj[path].mtime.getTime() || oldMtime
    
    dirs[path] = {
      files: {}, size: 0, mtime: readDirObj[path].mtime.getTime() || 0
    };

    if (newmtime > oldmtime) _updated[path] = dirs[path]
  });

  // Add files
  readFiles.sort((a, b) => {
    return utils.naturalSort(a.path, b.path);
  }).forEach(f => {
    const parentDir = normalize(utils.removeFilesPath(path.dirname(f.path)));
    const size = (f.stats && f.stats.size) ? f.stats.size : 0;
    const mtime = (f.stats && f.stats.mtime && f.stats.mtime.getTime) ? f.stats.mtime.getTime() : 0;
    
    let normPath = normalize(path.basename(f.path))
    // let oldmtime = updated[parentDir].files[normPath] ? updated[parentDir].files[normPath].mtime : 0
    let oldmtime = 0; let oldsize = 0;
    if (updated[parentDir] && updated[parentDir].files && updated[parentDir].files[normPath]) {
      oldmtime = updated[parentDir].files[normPath].mtime ? updated[parentDir].files[normPath].mtime : 0
      oldsize = updated[parentDir].files[normPath].size ? updated[parentDir].files[normPath].size : 0
    }
    if ( !( (mtime === oldmtime) && (size === oldsize) ) ) {
      if (!_updated.hasOwnProperty(parentDir)) _updated[parentDir] = {}
      if (!_updated[parentDir].hasOwnProperty('files')) _updated[parentDir].files = {}
      _updated[parentDir].files[normPath] = {oldsize, oldmtime, mtime, size}
    }
    
    dirs[parentDir].files[normalize(path.basename(f.path))] = {size, mtime};
    dirs[parentDir].size += size;
  });

  // hack
  console.log("\n\nfiletree.js::updateDirInCache() updated files:", _updated, "\n\n")
  
  update(root);
}

function updateDirSizes() {
  const todo = Object.keys(dirs);

  todo.sort((a, b) => {
    return utils.countOccurences(b, "/") - utils.countOccurences(a, "/");
  });

  todo.forEach(d => {
    dirs[d].size = 0;
    Object.keys(dirs[d].files).forEach(f => {
      dirs[d].size += dirs[d].files[f].size;
    });
  });

  todo.forEach(d => {
    if (path.dirname(d) !== "/" && dirs[path.dirname(d)]) {
      dirs[path.dirname(d)].size += dirs[d].size;
    }
  });
  //hack
  // console.log("filetree.js::updateDirSizes()", dirs)
  updated = dirs
}

//hack ////////////////////////////////////////////
filetree.getDirs = function() {
  return dirs
}
///////////////////////////////////////////////////


filetree.del = function(dir) {
  fs.stat(utils.addFilesPath(dir), (err, stats) => {
    if (err) log.error(err);
    if (!stats) return;
    if (stats.isFile()) {
      filetree.unlink(dir);
    } else if (stats.isDirectory()) {
      filetree.unlinkdir(dir);
    }
  });
};

filetree.unlink = function(dir) {
  lookAway();
  utils.rm(utils.addFilesPath(dir), err => {
    if (err) log.error(err);
    delete dirs[path.dirname(dir)].files[path.basename(dir)];
    update(path.dirname(dir));
  });
};

filetree.unlinkdir = function(dir) {
  lookAway();
  utils.rm(utils.addFilesPath(dir), err => {
    if (err) log.error(err);
    delete dirs[dir];
    Object.keys(dirs).forEach(d => {
      if (new RegExp("^" + escRe(dir) + "/").test(d)) delete dirs[d];
    });
    update(path.dirname(dir));
  });
};

filetree.clipboard = function(src, dst, type) {
  fs.stat(utils.addFilesPath(src), (err, stats) => {
    lookAway();
    if (err) log.error(err);
    if (stats.isFile()) {
      filetree[type === "cut" ? "mv" : "cp"](src, dst);
    } else if (stats.isDirectory()) {
      filetree[type === "cut" ? "mvdir" : "cpdir"](src, dst);
    }
  });
};

filetree.mk = function(dir, cb) {
  lookAway();
  fs.stat(utils.addFilesPath(dir), err => {
    if (err && err.code === "ENOENT") {
      fs.open(utils.addFilesPath(dir), "wx", (err, fd) => {
        if (err) {
          log.error(err);
          if (cb) cb(err);
          return;
        }
        fs.close(fd, error => {
          if (error) log.error(error);
          dirs[path.dirname(dir)].files[path.basename(dir)] = {size: 0, mtime: Date.now()};
          update(path.dirname(dir));
          if (cb) cb();
        });
      });
    } else if (err) {
      log.error(err);
      if (cb) cb(err);
    } else {
      if (cb) cb();
    }
  });
};

filetree.mkdir = function(dir, cb) {
  lookAway();
  fs.stat(utils.addFilesPath(dir), err => {
    if (err && err.code === "ENOENT") {
      utils.mkdir(utils.addFilesPath(dir), err => {
        if (err) {
          log.error(err);
          if (cb) cb(err);
          return;
        }
        dirs[dir] = {files: {}, size: 0, mtime: Date.now()};
        update(path.dirname(dir));
        if (cb) cb();
      });
    } else if (err) {
      log.error(err);
      if (cb) cb(err);
    } else {
      if (cb) cb();
    }
  });
};

filetree.move = function(src, dst, cb) {
  lookAway();
  fs.stat(utils.addFilesPath(src), (err, stats) => {
    if (err) log.error(err);
    if (stats.isFile()) {
      filetree.mv(src, dst, cb);
    } else if (stats.isDirectory()) {
      filetree.mvdir(src, dst, cb);
    }
  });
};

filetree.mv = function(src, dst, cb) {
  lookAway();
  utils.move(utils.addFilesPath(src), utils.addFilesPath(dst), err => {
    if (err) log.error(err);
    dirs[path.dirname(dst)].files[path.basename(dst)] = dirs[path.dirname(src)].files[path.basename(src)];
    delete dirs[path.dirname(src)].files[path.basename(src)];
    update(path.dirname(src));
    update(path.dirname(dst));
    if (cb) cb();
  });
};

filetree.mvdir = function(src, dst, cb) {
  lookAway();
  utils.move(utils.addFilesPath(src), utils.addFilesPath(dst), err => {
    if (err) log.error(err);
    // Basedir
    dirs[dst] = dirs[src];
    delete dirs[src];
    // Subdirs
    Object.keys(dirs).forEach(dir => {
      if (new RegExp("^" + escRe(src) + "/").test(dir) && dir !== src && dir !== dst) {
        dirs[dir.replace(new RegExp("^" + escRe(src) + "/"), dst + "/")] = dirs[dir];
        delete dirs[dir];
      }
    });
    update(path.dirname(src));
    update(path.dirname(dst));
    if (cb) cb();
  });
};

filetree.cp = function(src, dst, cb) {
  lookAway();
  utils.copyFile(utils.addFilesPath(src), utils.addFilesPath(dst), () => {
    dirs[path.dirname(dst)].files[path.basename(dst)] = cloneDeep(dirs[path.dirname(src)].files[path.basename(src)]);
    dirs[path.dirname(dst)].files[path.basename(dst)].mtime = Date.now();
    update(path.dirname(dst));
    if (cb) cb();
  });
};

filetree.cpdir = function(src, dst, cb) {
  lookAway();
  utils.copyDir(utils.addFilesPath(src), utils.addFilesPath(dst), () => {
    // Basedir
    dirs[dst] = cloneDeep(dirs[src]);
    dirs[dst].mtime = Date.now();
    // Subdirs
    Object.keys(dirs).forEach(dir => {
      if (new RegExp("^" + escRe(src) + "/").test(dir) && dir !== src && dir !== dst) {
        dirs[dir.replace(new RegExp("^" + escRe(src) + "/"), dst + "/")] = cloneDeep(dirs[dir]);
        dirs[dir.replace(new RegExp("^" + escRe(src) + "/"), dst + "/")].mtime = Date.now();
      }
    });
    update(path.dirname(dst));
    if (cb) cb();
  });
};

filetree.save = function(dst, data, cb) {
  lookAway();
  fs.stat(utils.addFilesPath(dst), err => {
    if (err && err.code !== "ENOENT") return cb(err);
    fs.writeFile(utils.addFilesPath(dst), data, err => {
      dirs[path.dirname(dst)].files[path.basename(dst)] = {size: Buffer.byteLength(data), mtime: Date.now()};
      update(path.dirname(dst));
      if (cb) cb(err);
    });
  });
};

function entries(files, folders, relativePaths, base) {
  const entries = {};
  files.forEach(file => {
    const f = dirs[path.dirname(file)].files[path.basename(file)];
    const mtime = Math.round(f.mtime / 1e3);
    const name = relativePaths ? path.relative(base, file) : path.basename(file);
    entries[name] = ["f", mtime, f.size].join("|");
  });
  folders.forEach(folder => {
    if (dirs[folder]) {
      const d = dirs[folder];
      const mtime = Math.round(d.mtime / 1e3);
      const name = relativePaths ? path.relative(base, folder) : path.basename(folder);
      entries[name] = ["d", mtime, d.size].join("|");
    }
  });
  //hack
  // console.log("filetree.js::entries()", JSON.stringify(entries, null, 2))
  return entries;
}

filetree.search = function(query, p) {
  if (!dirs[p] || typeof query !== "string" || !query) return null;
  const files = [];
  const folders = [];
  query = query.toLowerCase();
  Object.keys(dirs).filter(dir => {
    return dir.indexOf(p) === 0;
  }).forEach(dir => {
    if (dir.toLowerCase().includes(query) && dir !== p) {
      folders.push(dir);
    }
    Object.keys(dirs[dir].files).forEach(file => {
      if (file.toLowerCase().includes(query)) {
        files.push(path.posix.join(dir, file));
      }
    });
  });
  const e = entries(files, folders, true, p);
  if (!Object.keys(e).length) return null;
  return e;
};

filetree.ls = function(p) {
  if (!dirs[p]) return;
  const files = Object.keys(dirs[p].files).map(file => {
    return path.posix.join(p, file);
  });
  const folders = [];
  Object.keys(dirs).forEach(dir => {
    if (path.dirname(dir) === p && path.basename(dir)) {
      folders.push(dir);
    }
  });
  return entries(files, folders);
};

filetree.lsFilter = function(p, re) {
  if (!dirs[p]) return;
  return Object.keys(dirs[p].files).filter(file => {
    return re.test(file);
  });
};

function normalize(str) {
  return String.prototype.normalize ? str.normalize() : str;
}
