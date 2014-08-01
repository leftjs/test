AV.Cloud.define("hello", function(request, response) {
	response.success("测试成功");
});
AV.Cloud.define("getItem", function(request, response) {
	// User's location
	var userGeoPoint = new AV.GeoPoint({
		latitude : request.params.latitude,
		longitude : request.params.longitude
	});
	var Shops = AV.Object.extend("Shop");
	var query = new AV.Query(Shops);
	query.withinKilometers("location", userGeoPoint, 6);
	query.find().then(function(shops) {
		if (shops.length == 0) {
			//处理显示无信息
			response.error("你好");
		} else {
			var shopIds = new Array();
			for (var i = 0; i < shops.length; i++) {
				shopIds.push(shops[i].id);
			}
			var Item = AV.Object.extend("Item");
			var query = new AV.Query(Item);
			query.containedIn("shopId", shopIds);
			query.find({
				success : function(items) {
					for (var i = 0; i < items.length; i++) {
						for (var j = 0; j < shops.length; j++) {
							if (items[i].get("shopId") == shops[j].id) {
								items[i].set("shopName", shops[j].get("name"));
								items[i].set("location", shops[j].get("location"));
								break;
							}
						}
					}
					response.success(items);
				},
				error : function(error) {
					response.error(error.message);
				}
			});
		}
	}, function(error) {

	});
	// ({
	// success : function(Items) {
	// response.success(Items);
	// }
	// });
});
//获取收藏
AV.Cloud.define("getFavorite", function(request, response) {
	var favoriateItem = AV.Object.extend("Favorite");
	var query = new AV.Query(favoriateItem);
	query.equalTo("userId", request.params.userId);
	query.find({
		success : function(results) {
			if (results.length == 0) {
				response.error("你好");
			} else {
				var favoriates = new Array();
				for (var i = 0; i < results.length; i++) {
					favoriates.push(results[i].get("itemId"));
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
//获取购物车
AV.Cloud.define("getShoppingCart", function(request, response) {
	var Item = AV.Object.extend("Item");
	var query = new AV.Query(Item);
	query.containedIn("objectId", request.params.itemIds);
	query.find({
		success : function(results) {
			response.success(results);
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
