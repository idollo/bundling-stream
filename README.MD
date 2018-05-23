# bundling-stream

Bundle the writing data for decreasing the IOPS. such as writing logs to disk.

This feature is consider from the Nginx buffering access log config:
```
access_log path [format [buffer=size] [gzip[=level]] [flush=time] [if=condition]];
```

## Install
```
npm install bundling-stream
```

## API

BunlingStream(options)

**options** <Object>
* **buffer** <integer> Default:4096. size of bundling data.
* **timing** <integer> Default:false. actived flush timing in seconds. 

The bundled data will be flush:
1. if the next log line does not fit into the buffer;
2. if the buffered data is older than specified by the timing parameter in seconds.
3. finish writing: end() has been called.


```js
const fs = require("fs");

var bws = require('bundling-stream')({"buffer":4096, "timing":10});

var fsteam = fs.createWriteSteam("access.log", {flags:"a+"});

bws.pipe(fsteam); // pipe to a fileWiteSteam.

for(var i=0; i<100000; i++){
	bws.write("some log message.\n");
}

```

