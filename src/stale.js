/**
 * Removes stale representation from disk
 *
 * @method stale
 * @public
 * @param  {String} url LRUItem key
 * @return {Object}     TurtleIO instance
 */
TurtleIO.prototype.stale = function ( url ) {
	var self   = this,
	    cached = this.etags.cache[url],
	    path   = this.config.tmp + "/",
	    gz, df;

	if ( cached ) {
		path += cached.value.etag;
		gz    = path + ".gz";
		df    = path + ".zz";

		fs.exists( gz, function ( exists ) {
			if ( exists ) {
				fs.unlink( gz, function ( e ) {
					if ( e ) {
						self.log( e );
					}
				} );
			}
		} );

		fs.exists( df, function ( exists ) {
			if ( exists ) {
				fs.unlink( df, function ( e ) {
					if ( e ) {
						self.log( e );
					}
				} );
			}
		} );
	}

	return this;
};
