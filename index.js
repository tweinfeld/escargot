const
    _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    kefir = require('kefir'),
    Writable = require('stream').Writable;

const
    KILOBYTE = 1024,
    DEFAULT_MAX_FILE_SIZE = 1000 * KILOBYTE,
    DEFAULT_FILE_PATH = process.cwd(),
    DEFAULT_MAX_FILE = 5,
    DEFAULT_FILE_TEMPLATE = (serial)=> `file_${serial + 1}.txt`;

module.exports = function({
    filenameTemplate = DEFAULT_FILE_TEMPLATE,
    filePath = DEFAULT_FILE_PATH,
    maxFile = DEFAULT_MAX_FILE,
    maxFileSize = DEFAULT_MAX_FILE_SIZE
} = {}){

    let sink,
        dataStream = kefir.stream(({ emit })=> { sink = emit; });

    let processStream = kefir
        .combine([dataStream], [
            dataStream
                .map((messageBuffer)=> messageBuffer.length)
                .scan((a,b)=> a+b, 0)
                .map((size)=> ~~(size / maxFileSize))
                .map((fileSerial)=> maxFile ? fileSerial % maxFile : fileSerial)
                .map((serial)=> path.join(filePath, filenameTemplate(serial)))
                .skipDuplicates()
                .map((fileName)=>fs.createWriteStream(fileName, { flags: 'w' }))
                .toProperty()
            ]).onValue(([ data, fileStream ])=>{
                fileStream.write(data);
            });

    return new Writable({
        write(chunk, encoding, callback){
            sink(chunk);
            callback(null);
        }
    });
};