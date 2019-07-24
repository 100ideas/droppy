# droppy v11.1.0 patched fork



## todo

- figure out how to automatically connect react app to droppy via ws
  - client's first ws message is `REQUEST_SETTINGS` and includes token 
    - {"vId":null,"type":"REQUEST_SETTINGS","token":"205dffe5ab5b855ef9d49142c5b0e137"}
- use GET in react to load files
- write fileprovider component to manage linkage w/ droppy
  - should be able to set droppy config: watch folder
  - use file-system-react or something similar / easy
- for each file in fileprovider: 
  - assign uuid
  - track current filename, size, mtime
  - event log of all previous chokidar & frontend events?
  - can create file entry before file is present
  - can click 'save' button to send to droppy
  - local browser version is cached and alerts user if droppy fs version conflicts
- add drag-n-drop file upload
- application state:
  - serialize filemanager collection via droppy
  - serialize notebook file via droppy

  

## changes

`server/filetree.js`:
- (L47) configured chokidar to emit all 'chokidar' change events to `server.js` which sends them over ws to client.
  - file rename is represented as two events
    - `{event: "unlink", path: '/base/oldname.ext'}` 
    - `{event: "add", path: '/newbase/newname.ext', stats}`
  - detect renames by: 
    - looking for 'unlink' and 'add' chokidar events close in time
    - checking similarity of filename; extension should stay same
    - tracking similarity in filesize {stats: {size: 10677}}
- (L54-200) before using chokidar, implemented a file-change detector based on preexisting filetree metadata. should disable it.
- (L228) `filetree.getDirs` returns obj representing current file tree.

`server/server.js`:
- (L674) websocket on  receive 'LS_ALL', use `sendObj` to emit {type: 'ALL_FILES', filetree.getDirs} to client over ws.
- see `README_browser_console.log` for a list of all ws message types

`client/client.js`:
- (temporarily) exposed ws message sender on browser `window.droppysend = sendMessage`; simplifies testing in console like `droppysend(0, 'LS_ALL')`


example of "CHOKIDAR" ws event
```js
{
  "type": "CHOKIDAR",
  "event": {
    "event": "change",
    "path": "/csv/j5_Report.csv",
    "fullpath": "/Users/100ideas/Desktop/droppy/csv/j5_Report.csv",
    "stats": {
      "blksize": 4096,
      "ino": 71011926,
      "size": 4010,
      "blocks": 8,
      "atimeMs": 1563967409662.8582,
      "mtimeMs": 1563967409666.2268,
      "ctimeMs": 1563967409666.2268,
      "birthtimeMs": 1563932162252.8052,
      //.. etc
    }
  }
}
```

example of response to LS_ALL:
```js
// in browser console
droppysend(0, 'LS_ALL')

response = {
"type":"ALL_FILES",
  "data":{

  "/":          {"files": {".DS_Store":{"size":6148,"mtime":1563956509557},"j5_Report.csv":{"size":3988,        "mtime":1563930180731},"nochockinew.txt":{"size":874,"mtime":1563964489898},"project-trackbook ux interview 1.md":{"size":7129,"mtime":1538466815770},"puc19fsa.txt":{"size":2825,"mtime":1563933760441}},"size":88932,"mtime":1563964448891},

  "/csv":       {"files": {"20170817_quantification_oshv_orf117_plasmid - QubitData_2017-08-17_10-33-11.csv":{"size":491,"mtime":1563932162253},".DS_Store":{"size":6148,"mtime":1563956468567},"Oligo_Synthesis_cgg.csv":{"size":891,"mtime":1563964329627},"j5_Report.csv":{"size":3988,"mtime":1563932162255}},"size":18950,"mtime":1563962620331},

  "/csv/notes": {"files":{"browser-console.log.js":{"size":7425,"mtime":1563962332069},"foo.txt":{"size":7,"mtime":1563956500700}},"size":7432,"mtime":1563956752451}
}}
```





---

**droppy** is a self-hosted file storage server with a web interface and capabilities to edit files and view media directly in the browser. It is particularly well-suited to be run on low-end hardware like the Raspberry Pi.

- repo https://github.com/silverwind/droppy/
- demo https://droppy.silverwind.io/
