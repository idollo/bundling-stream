(function () {

	var	util = require('util')
	,	events = require('events')
	,	Transform = require('stream').Transform
	,	EventEmitter = events.EventEmitter
	;

	util.inherits(BundlingStream, Transform);

	function nop() {}

	function BundlingStream(options) {
		if (!(this instanceof BundlingStream))
			return new BundlingStream(options);

		Transform.call(this, options);
		this._chunkSize = 0;
		this._bufferedChunks = [];
		this._buffer = +(options && options.buffer) || 4096; // default to 4k buffer
		this._lastChunkStartTime = (+new Date);
		this._timing = +(options && options.timing) || 0;
		this._timer = null;
	}

	Object.assign(BundlingStream.prototype, {
		_flush: function(done){
			return this._flushData(done);
		},

		_transform: function (chunk, encoding, done) {
			this._setTiming();
			this._bufferedChunks.push({chunk, encoding});
			this._chunkSize += chunk.length;
			if(this._buffer && this._chunkSize >= this._buffer){
				return this._flushData(done);
			}
			if(this._timing && ((+new Date)-this._lastChunkStartTime) >= this._timing*1000 ){
				return this._flushData(done);
			}

			return done && done();
		},

		_flushData: function(done){
			clearTimeout(this._timer);
			this._timer = null;
			while(this._bufferedChunks.length){
				var chunk = this._bufferedChunks.shift();
				this.push(chunk.chunk, chunk.encoding);
			}
			this._chunkSize = 0;
			this._lastChunkStartTime = (+ new Date);
			done && done();
		},

		_setTiming: function(){
			if(this._timing && !this._timer){
				this._timer = setTimeout(()=>{
					this._flushData();
				}.bind(this), this._timing*1000);
			}
		}

	});

	module.exports = BundlingStream;

})();


