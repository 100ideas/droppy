// client -> server ... server.js#431 received msg.type strings 
"REQUEST_SETTINGS"
"REQUEST_UPDATE"
"RELOAD_DIRECTORY"
"DESTROY_VIEW"
"REQUEST_SHARELINK"
"DELETE_FILE"
"SAVE_FILE"
"CLIPBOARD"
"CREATE_FOLDER"
"CREATE_FILE"
"RENAME"
"GET_USERS"
"UPDATE_USER"
"CREATE_FILES"
"CREATE_FOLDERS"
"GET_MEDIA"
"SEARCH"

import {Server} from "http";


// server -> client.... server.js sendObj message {type: ____, vId, payload}
// sendObj(sid, {type: "SAVE_STATUS", vId, status : err ? 1 : 0})
"SETTINGS", 
"UPDATE_BE_FILE",
"SHARELINK",
"SAVE_STATUS",
"MEDIA_FILES",
"SEARCH_RESULTS",
"UPDATE_DIRECTORY",
"USER_LIST",
"ERROR", 
"RELOAD",


//---------

droppysend(0, 'REQUEST_UPDATE', '/')
send1 = {
  data: {
    "bdsmlr-324764-CdMeExWWcI-og.jpg": "f|1562678738|67968",
    "csv": "d|1563932162|5366",
    "j5_Report.csv": "f|1563930181|3988",
    "project-trackbook ux interview 1.md": "f|1538466816|7129",
    "puc19fsa.txt": "f|1563930186|2825",
    "folder": "/",
    type: "UPDATE_DIRECTORY",
    vId: 0
  }
}

// editor: capitalize last three chars of first line of puc19fsa.txt
rec1 = {
  data: {
    "bdsmlr-324764-CdMeExWWcI-og.jpg": "f|1562678738|67968",
    csv: "d|1563932162|5366",
    "j5_Report.csv": "f|1563930181|3988",
    "project-trackbook ux interview 1.md": "f|1538466816|7129",
    "puc19fsa.txt": "f|1563933532|2825",
    folder: "/",
    type: "UPDATE_DIRECTORY",
    vId: 0
  }
}


// in droppy editor - edit last three chars of puc19fsa.txt to be lowercase
send2 = {
  "vId": 0,
  "type": "SAVE_FILE",
  "data": {
    "to": "/puc19fsa.txt",
    "value": ">pUC19 [length=2686] [version=09-MAY-2008] [topology=circular] Cloning vector pUC19, complete sequence.\nTCGCGCGTTTCGGTGATGACGGTGAAAACCTCTGACACATGCAGCTCCCGGAGACGGTCACAGCTTGTCTGTAAGCGGAT\nGCCGGGAGCAGACAAGCCCGTCAGGGCGCGTCAGCGGGTGTTGGCGGGTGTCGGGGCTGGCTTAACTATGCGGCATCAGA\nGCAGATTGTACTGAGAGTGCACCATATGCGGTGTGAAATACCGCACAGATGCGTAAGGAGAAAATACCGCATCAGGCGCC\nATTCGCCATTCAGGCTGCGCAACTGTTGGGAAGGGCGATCGGTGCGGGCCTCTTCGCTATTACGCCAGCTGGCGAAAGGG\nGGATGTGCTGCAAGGCGATTAAGTTGGGTAACGCCAGGGTTTTCCCAGTCACGACGTTGTAAAACGACGGCCAGTGAATT\nCGAGCTCGGTACCCGGGGATCCTCTAGAGTCGACCTGCAGGCATGCAAGCTTGGCGTAATCATGGTCATAGCTGTTTCCT\nGTGTGAAATTGTTATCCGCTCACAATTCCACACAACATACGAGCCGGAAGCATAAAGTGTAAAGCCTGGGGTGCCTAATG\nAGTGAGCTAACTCACATTAATTGCGTTGCGCTCACTGCCCGCTTTCCAGTCGGGAAACCTGTCGTGCCAGCTGCATTAAT\nGAATCGGCCAACGCGCGGGGAGAGGCGGTTTGCGTATTGGGCGCTCTTCCGCTTCCTCGCTCACTGACTCGCTGCGCTCG\nGTCGTTCGGCTGCGGCGAGCGGTATCAGCTCACTCAAAGGCGGTAATACGGTTATCCACAGAATCAGGGGATAACGCAGG\nAAAGAACATGTGAGCAAAAGGCCAGCAAAAGGCCAGGAACCGTAAAAAGGCCGCGTTGCTGGCGTTTTTCCATAGGCTCC\nGCCCCCCTGACGAGCATCACAAAAATCGACGCTCAAGTCAGAGGTGGCGAAACCCGACAGGACTATAAAGATACCAGGCG\nTTTCCCCCTGGAAGCTCCCTCGTGCGCTCTCCTGTTCCGACCCTGCCGCTTACCGGATACCTGTCCGCCTTTCTCCCTTC\nGGGAAGCGTGGCGCTTTCTCATAGCTCACGCTGTAGGTATCTCAGTTCGGTGTAGGTCGTTCGCTCCAAGCTGGGCTGTG\nTGCACGAACCCCCCGTTCAGCCCGACCGCTGCGCCTTATCCGGTAACTATCGTCTTGAGTCCAACCCGGTAAGACACGAC\nTTATCGCCACTGGCAGCAGCCACTGGTAACAGGATTAGCAGAGCGAGGTATGTAGGCGGTGCTACAGAGTTCTTGAAGTG\nGTGGCCTAACTACGGCTACACTAGAAGAACAGTATTTGGTATCTGCGCTCTGCTGAAGCCAGTTACCTTCGGAAAAAGAG\nTTGGTAGCTCTTGATCCGGCAAACAAACCACCGCTGGTAGCGGTGGTTTTTTTGTTTGCAAGCAGCAGATTACGCGCAGA\nAAAAAAGGATCTCAAGAAGATCCTTTGATCTTTTCTACGGGGTCTGACGCTCAGTGGAACGAAAACTCACGTTAAGGGAT\nTTTGGTCATGAGATTATCAAAAAGGATCTTCACCTAGATCCTTTTAAATTAAAAATGAAGTTTTAAATCAATCTAAAGTA\nTATATGAGTAAACTTGGTCTGACAGTTACCAATGCTTAATCAGTGAGGCACCTATCTCAGCGATCTGTCTATTTCGTTCA\nTCCATAGTTGCCTGACTCCCCGTCGTGTAGATAACTACGATACGGGAGGGCTTACCATCTGGCCCCAGTGCTGCAATGAT\nACCGCGAGACCCACGCTCACCGGCTCCAGATTTATCAGCAATAAACCAGCCAGCCGGAAGGGCCGAGCGCAGAAGTGGTC\nCTGCAACTTTATCCGCCTCCATCCAGTCTATTAATTGTTGCCGGGAAGCTAGAGTAAGTAGTTCGCCAGTTAATAGTTTG\nCGCAACGTTGTTGCCATTGCTACAGGCATCGTGGTGTCACGCTCGTCGTTTGGTATGGCTTCATTCAGCTCCGGTTCCCA\nACGATCAAGGCGAGTTACATGATCCCCCATGTTGTGCAAAAAAGCGGTTAGCTCCTTCGGTCCTCCGATCGTTGTCAGAA\nGTAAGTTGGCCGCAGTGTTATCACTCATGGTTATGGCAGCACTGCATAATTCTCTTACTGTCATGCCATCCGTAAGATGC\nTTTTCTGTGACTGGTGAGTACTCAACCAAGTCATTCTGAGAATAGTGTATGCGGCGACCGAGTTGCTCTTGCCCGGCGTC\nAATACGGGATAATACCGCGCCACATAGCAGAACTTTAAAAGTGCTCATCATTGGAAAACGTTCTTCGGGGCGAAAACTCT\nCAAGGATCTTACCGCTGTTGAGATCCAGTTCGATGTAACCCACTCGTGCACCCAACTGATCTTCAGCATCTTTTACTTTC\nACCAGCGTTTCTGGGTGAGCAAAAACAGGAAGGCAAAATGCCGCAAAAAAGGGAATAAGGGCGACACGGAAATGTTGAAT\nACTCATACTCTTCCTTTTTCAATATTATTGAAGCATTTATCAGGGTTATTGTCTCATGAGCGGATACATATTTGAATGTA\nTTTAGAAAAATAAACAAATAGGGGTTCCGCGCACATTTCCCCGAAAAGTGCCACCTGACGTCTAAGAAACCATTATTATC\nATGACATTAACCTATAAAAATAGGCGTATCACGAGGCCCTTTCGTC\n\n"
  },
  "token": "e57158ecfdad02b48a3752ce6701cdb9"
}

rec3 = {"type": "SAVE_STATUS", "vId": 0, "status": 0}

// puc19 hash updated to 1563933760
rec4 = {
  "type": "UPDATE_DIRECTORY",
  "vId": 0,
  "folder": "/",
  "data": {
    "bdsmlr-324764-CdMeExWWcI-og.jpg": "f|1562678738|67968",
    "j5_Report.csv": "f|1563930181|3988",
    "project-trackbook ux interview 1.md": "f|1538466816|7129",
    "puc19fsa.txt": "f|1563933760|2825",
    "csv": "d|1563932162|5366"
  }
}




// ---------- startup first connection -----------

// to server
{"vId": null, "type": "REQUEST_SETTINGS", "token": "94d05bc26a7276bcda0505b4b3279c4a"}

// to client
{"type": "SETTINGS", "vId": null, "settings": {"priv": true, "version": "11.1.0", "dev": true, "public": true, "readOnly": false, "watch": true, "engine": "node 10.15.3", "platform": "darwin", "caseSensitive": false, "themes": "3024-day|3024-night|abcdef|ambiance|ambiance-mobile|base16-dark|base16-light|bespin|blackboard|cobalt|colorforth|darcula|dracula|droppy|duotone-dark|duotone-light|eclipse|elegant|erlang-dark|gruvbox-dark|hopscotch|icecoder|idea|isotope|lesser-dark|liquibyte|lucario|material|mbo|mdn-like|midnight|monokai|neat|neo|night|nord|oceanic-next|panda-syntax|paraiso-dark|paraiso-light|pastel-on-dark|railscasts|rubyblue|seti|shadowfox|solarized|ssms|the-matrix|tomorrow-night-bright|tomorrow-night-eighties|ttcn|twilight|vibrant-ink|xq-dark|xq-light|yeti|yonce|zenburn", "modes": "apl|asciiarmor|asn.1|asterisk|brainfuck|clike|clojure|cmake|cobol|coffeescript|commonlisp|crystal|css|cypher|d|dart|diff|django|dockerfile|dtd|dylan|ebnf|ecl|eiffel|elm|erlang|factor|fcl|forth|fortran|gas|gfm|gherkin|go|groovy|haml|haskell|haskell-literate|haxe|htmlembedded|htmlmixed|http|idl|javascript|jinja2|jsx|julia|livescript|lua|markdown|mathematica|mbox|mirc|mllike|modelica|mscgen|mumps|nginx|nsis|ntriples|octave|oz|pascal|pegjs|perl|php|pig|powershell|properties|protobuf|pug|puppet|python|q|r|rpm|rst|ruby|rust|sas|sass|scheme|shell|sieve|slim|smalltalk|smarty|solr|soy|sparql|spreadsheet|sql|stex|stylus|swift|tcl|textile|tiddlywiki|tiki|toml|tornado|troff|ttcn|ttcn-cfg|turtle|twig|vb|vbscript|velocity|verilog|vhdl|vue|webidl|xml|xquery|yacas|yaml|z80"} }

// to server
{"vId": 0, "type": "REQUEST_UPDATE", "data": "/bdsmlr-324764-CdMeExWWcI-og.jpg", "token": "0937f7968b382729ebb9d78f24d5ef14"}

// to client
{"type": "UPDATE_BE_FILE", "file": "bdsmlr-324764-CdMeExWWcI-og.jpg", "folder": "/", "isFile": true, "vId": 0}

// to server
{"vId": 0, "type": "GET_MEDIA", "data": {"dir": "/", "exts": {"img": ["png", "apng", "bmp", "gif", "ico", "jpg", "jpeg", "svg", "webp"], "vid": ["3g2", "3gp", "f4v", "flv", "m4v", "mk3d", "mkv", "mov", "mp4", "ogv", "ogx", "webm"], "pdf": ["pdf"]} }, "token": "7863874e24275a809b5307e59f641f54"}

// to client
{"type": "MEDIA_FILES", "vId": 0, "files": [{"src": "bdsmlr-324764-CdMeExWWcI-og.jpg", "w": 790, "h": 588}]}

// to server
droppysend(0, 'REQUEST_UPDATE', '/csv')