AV.Cloud.define("hello", function(request, response) {
	response.success("测试成功");
});
AV.Cloud.define("getItem", function(request, response) {
	// User's location
	var userGeoPoint = new AV.GeoPoint({
		latitude : request.params.latitude,
		longitude : request.params.longitude
	});
	var Items = AV.Object.extend("Item");
	// Create a query for places
	var query = new AV.Query(Items);
	query.withinKilometers("location", userGeoPoint, 6);
	// Limit what could be a lot of points.
	query.limit(10);
	query.find({
		success : function(Items) {
			response.success(Items);
		}
	});
});
