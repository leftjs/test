//获取收藏
AV.Cloud.define("getFavorite", function(request, response) {
	var favoriateItem = AV.Object.extend("Favorite");
	var query = new AV.Query(favoriateItem);
	query.equalTo("userId", request.params.userId);
	query.find().then(function(results) {
		if (results.length == 0) {
			response.error(2);
		} else {
			var favoriates = new Array();
			for (var i = 0; i < results.length; i++) {
				favoriates.push(results[i].get("itemId"));
			}
			var Item = AV.Object.extend("Item");
			var query = new AV.Query(Item);
			query.containedIn("objectId", favoriates);
			query.find().then(function(results) {
				response.success(results);
			}, function(error) {
				response.error(error.message);
			});
		}
	}, function(error) {
		response.error(error.message);
	});
});
//获取购物车
AV.Cloud.define("getShoppingCart", function(request, response) {
	var Item = AV.Object.extend("Item");
	var query = new AV.Query(Item);
	query.containedIn("objectId", request.params.itemIds);
	query.include("shop");
	query.find().then(function(results) {
		response.success(results);
	}, function(error) {
		response.error(error.message);
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
	order.save().then(function(order) {
		response.success();
	}, function(order, error) {
		response.error(error.description);
	});
});
//收藏去重
AV.Cloud.beforeSave("Favorite", function(request, response) {
	var Favorite = AV.Object.extend("Favorite");
	var query = new AV.Query(Favorite);
	query.equalTo("userId", request.object.get("userId"));
	query.equalTo("itemId", request.object.get("itemId"));
	query.count({
		success : function(count) {
			if (count == 0)
				response.success();
			else
				response.error(2);
		},
		error : function(error) {
			response.error();
		}
	});
});
