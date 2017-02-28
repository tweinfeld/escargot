# Escargot

## Escargot is a rolling file writer

Escargot writes to a span of files, creating new files as required. That's it!

## Installation

```bash
npm install escargot
```

## Usage
```javascript
let
    fs = require('fs'),
    escargot = require('.');

let stream = fs.createReadStream('very_large_file.bin');

stream.pipe(escargot({
    filePath: process.cwd(),
    filenameTemplate: (serial)=>`my_dump_${serial}`,
    maxFileSize: 1000,
    maxFile: 5
}));
```

* filePath - The path to which to write output files (defaults to ```process.cwd```)
* filenameTemplate - A function that returns the filename to be written. Recieves the serial number of a file. Defaults to: ```(serial)=> `file_${serial + 1}.txt` ```
* maxFileSize - The size (in bytes) of each file to be written.
* maxFile - The maximal number of files to write before rolling. 0 for no rolling output. 