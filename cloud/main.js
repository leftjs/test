AV.Cloud.define("hello", function(request, response) {
	response.success("测试成功");
});
AV.Cloud.define("getItem", function(request, response) {
	//var items = new Array();
	//var query = new AV.Query("Item");
	//query.equalTo("ciry", request.params.city);
	//query.find({
	//	success : function(results) {
	//	for (var i = 0; i < results.length; ++i) {
	//		if()
	//	}
	//		response.success(getFlatternDistance(0,0,0,0));
	//	},
	//	error : function() {
	//		response.error("获取失败");
	//	}
	//	});
	response.success(getFlatternDistance(0, 0, 0, 0));
});

function getFlatternDistance(lat1, lng1, lat2, lng2) {
	var f = getRad((lat1 + lat2) / 2);
	var g = getRad((lat1 - lat2) / 2);
	var l = getRad((lng1 - lng2) / 2);

	var sg = Math.sin(g);
	var sl = Math.sin(l);
	var sf = Math.sin(f);

	var s, c, w, r, d, h1, h2;
	var a = EARTH_RADIUS;
	var fl = 1 / 298.257;

	sg = sg * sg;
	sl = sl * sl;
	sf = sf * sf;

	s = sg * (1 - sl) + (1 - sf) * sl;
	c = (1 - sg) * (1 - sl) + sf * sl;

	w = Math.atan(Math.sqrt(s / c));
	r = Math.sqrt(s * c) / w;
	d = 2 * w * a;
	h1 = (3 * r - 1) / 2 / c;
	h2 = (3 * r + 1) / 2 / s;

	return d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
}