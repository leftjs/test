AV.Cloud.define("hello", function(request, response) {
	response.success("测试成功");
});
AV.Cloud.define("getItem", function(request, response) {
	// User's location
	var userGeoPoint = request.params.geoPoint;
	var Items = AV.Object.extend("Item");
	// Create a query for places
	var query = new AV.Query(Items);
	// Interested in locations near user.
	query.near("location", userGeoPoint);
	query.withinKilometers(2);
	// Limit what could be a lot of points.
	query.limit(10);
	// Final list of objects
	query.find({
		success : function(Items) {
			response.success(Items[0].name + "");
		}
	});
});
