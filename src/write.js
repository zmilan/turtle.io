/**
 * Writes files to disk
 * 
 * @method write
 * @param  {String} path  File path
 * @param  {Object} res   HTTP response Object
 * @param  {Object} req   HTTP request Object
 * @param  {Object} timer Date instance
 * @return {Object}       Instance
 */
factory.prototype.write = function (path, res, req, timer) {
	var self  = this,
	    put   = (req.method === "PUT"),
	    body  = "",
	    allow = allows(req.url),
	    del   = allowed("DELETE", req.url);

	if (!put && /\/$/.test(req.url)) self.respond(res, req, (del ? messages.CONFLICT : messages.ERROR_APPLICATION), (del ? codes.CONFLICT : codes.ERROR_APPLICATION), {"Allow" : allow}, timer);
	else {
		allow = allow.explode().remove("POST").join(", ");

		req.on("data", function (data) { 
			body += data;
		});

		req.on("end", function () {
			fs.readFile(path, function (e, data) {
				var hash = "\"" + self.hash(data) + "\"";

				if (e) self.respond(res, req, messages.ERROR_APPLICATION, codes.ERROR_APPLICATION, undefined, timer);
				switch (true) {
					case !req.headers.hasOwnProperty(etag):
					case req.headers.etag === hash:
						fs.writeFile(path, body, function (e) {
							if (e) self.error(res, req, timer);
							else {
								dtp.fire("write", function (p) {
									return [req.headers.host, req.url, req.method, path, diff(timer)];
								});

								self.respond(res, req, (put ? messages.NO_CONTENT : messages.CREATED), (put ? codes.NO_CONTENT : codes.CREATED), {"Allow" : allow, Etag: hash}, timer);
							}
						});
						break;
					case req.headers.etag !== hash:
						self.respond(res, req, null, codes.FAILED);
						break;
					default:
						self.respond(res, req, messages.ERROR_APPLICATION, codes.ERROR_APPLICATION);
				}
			});
		});
	}

	return this;
};
