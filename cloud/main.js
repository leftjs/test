//下单处理函数
AV.Cloud.define("placeOrder", function(request, response) {
	var Order = AV.Object.extend("Order");
	var order = new Order();
	order.set("items", request.params.items);
	// User's location
	var location = new AV.GeoPoint({
		latitude : request.params.latitude,
		longitude : request.params.longitude
	});
	order.set("location", location);
	order.set("userId", request.params.userId);
	order.set("state", 1);
	order.save().then(function(order) {
		response.success();
	}, function(order, error) {
		response.error(error.description);
	});
}); 