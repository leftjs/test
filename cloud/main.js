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
//获取收藏
AV.Cloud.define("getFavorite", function(request, response) {
	var favoriateItem = AV.Object.extend("Favorite");
	var query = new AV.Query(favoriateItem);
	query.equalTo("userId", request.params.userId);
	query.find({
		success : function(results) {
			if (results.length == 0) {
				response.error("没有收藏");
			} else {
				var favoriates = new Array();
				for (var i = 0; i < results.length; i++) {
					favoriates.push(results.get("itemId"));
				}
				var Item = AV.Object.extend("Item");
				var query = new AV.Query(Item);
				query.containedIn("objectId", favoriates);
				query.find({
					success : function(results) {
						response.success(results);
					},
					error : function(error) {
						response.error(error.message);
					}
				});
			}
		},
		error : function(error) {
			response.error(error.message);
		}
	});
});
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
	order.save(null, {
		success : function(order) {
			response.success();
		},
		error : function(order, error) {
			response.error(error.description);
		}
	});
});
