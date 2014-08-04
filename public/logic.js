//popup对话框对象
var popup;
//购物车集合
var shoppoingCart = new Array();
//下单结果数组
var results = new Array();
//下单计数器
var orderCount = 0;
//加载主页商品
function loadItemMainPanel(Items) {
	var userGeo = new AV.GeoPoint({
		latitude : 31.717531,
		longitude : 118.787853
	});
	for (var i = 0; i < Items.length; i++) {
		var itemGeo = new AV.GeoPoint({
			latitude : Items[i].location.latitude,
			longitude : Items[i].location.longitude
		});
		var li = "<li><a data-transition='pop' data-id='" + Items[i].objectId + "' href='#buy_panel'><img src='" + Items[i].smallImage._url + "'><div><p>" + Items[i].name + "<span>" + Items[i].price + "元</span></p><p>" + Items[i].shopName + "<span>距您" + userGeo.kilometersTo(itemGeo).toFixed(2) + "km</span></p></div></a></li>";
		$("#main_panel ul").append(li);
	}
	$("#main_panel > div >  ul > li > a").click(function() {
		localStorage.setItem("itemId", $(this).attr("data-id"));
	});
}

//初始化广告
function initAdvertise() {
	var ad = AV.Object.extend("Advertise");
	var query = new AV.Query(ad);
	query.descending("updatedAt");
	query.limit(4);
	query.find().then(function(results) {
		for (var i = 0; i < results.length; i++) {
			var $img = $("<img></img>");
			$img.attr("src", results[i].get("picture").url());
			$("#slider").append($img);
		}
		$('#slider').nivoSlider();
	}, function(error) {
		alert("Error: " + error.code + " " + error.message);
	});
}

//加载购买面板
function buyPanelLoad() {
	var Item = AV.Object.extend("Item");
	var query = new AV.Query(Item);
	query.get(localStorage.getItem('itemId')).then(function(item) {
		$("#buy_panel #item_pic_big").attr('src', item.get('bigImage').url());
		$("#buy_panel #item_name").html(item.get("name"));
		$("#price_detail span").html(item.get("price"));
		$("#buy_panel #description").html(item.get("description"));
	}, function(object, error) {
		alert("加载失败" + error.message);
	});
}

//收藏
function collect() {
	var currentUser = AV.User.current();
	if (currentUser) {
		var Favorite = AV.Object.extend("Favorite");
		var favorite = new Favorite();
		favorite.set("userId", currentUser.id);
		favorite.set("itemId", localStorage.getItem('itemId'));
		favorite.save().then(function(favorite) {
			popup = af("#afui").popup("收藏成功");
		}, function(favorite, error) {
			if (error.message[error.message.length - 1] == 2)
				popup = af("#afui").popup("您不需要重复收藏");
			else
				popup = af("#afui").popup("收藏失败");
		});
	} else {
		//登录
		popup = loginPop();
	}
}

//加入购物车
function addToShoppingCart() {
	var currentUser = AV.User.current();
	if (currentUser) {
		var flag = false;
		var itemId = localStorage.getItem('itemId');
		for ( i = 0; i < shoppoingCart.length; i++) {
			if (itemId == shoppoingCart[i]) {
				flag = true;
				popup = af("#afui").popup("您不需要重复添加");
				break;
			}
		}
		if (flag == false) {
			shoppoingCart.push(itemId);
			popup = af("#afui").popup({
				title : "添加成功",
				message : "您是否需要？",
				cancelText : "继续购买",
				cancelCallback : function() {
				},
				doneText : "前往付款",
				doneCallback : function() {
					af.ui.loadContent("#shopping_cart_panel", false, false, false);
				},
				cancelOnly : false
			});
		}
	} else {
		popup = loginPop();
	}
}

//登录框
function loginPop() {
	return af("#afui").popup({
		title : "用户登录",
		message : "手机号: <input id='phone_number_login' type='text' class='af-ui-forms'><br />密码: <input id='password_login' type='text' class='af-ui-forms' style='webkit-text-security:disc'><br />还没有账号？请<span style='font-size:25px;color:blue;' onclick='registerPop()'>点击注册</span>",
		cancelText : "取消",
		cancelCallback : function() {
		},
		doneText : "登录",
		doneCallback : function() {
			AV.User.logIn($("#phone_number_login").val(), $("#password_login").val(), {
				success : function(user) {
					// Do stuff after successful login.
					popup = af("#afui").popup("登录成功");
				},
				error : function(user, error) {
					// The login failed. Check error to see why.
					popup = af("#afui").popup("登录成功");
				}
			});
		},
		cancelOnly : false
	});
}

//注册框
function registerPop() {
	popup.hide();
	popup = af("#afui").popup({
		title : "用户注册",
		message : "手机号: <input id='phone_number_register' type='text' class='af-ui-forms'><br />密码: <input id='password_register' type='text' class='af-ui-forms' style='webkit-text-security:disc'><br />确认密码: <input id='password_confirm_register'  type='text' class='af-ui-forms' style='webkit-text-security:disc'>",
		cancelText : "取消",
		cancelCallback : function() {
		},
		doneText : "注册",
		doneCallback : function() {
			//处理注册的一些操作
			if (!$('#phone_number_register').val().match(/^1[3|4|5|8][0-9]\d{4,8}$/)) {
				alert("手机号码格式不正确");
			} else if ($('#password_register').val() != $('#password_confirm_register').val()) {
				alert("两次密码输入不一致");
			} else if (($('#password_register').val().length < 6) || ($('#password_register').val().length > 20)) {
				alert("密码长度请保持在6到20位之间");
			} else {
				var user = new AV.User();
				user.set("username", $('#phone_number_register').val());
				user.set("password", $('#password_register').val());
				user.set("numberVerified", false);
				// 更新地理位置信息
				user.signUp(null, {
					success : function(user) {
						// Hooray! Let them use the app now.
						alert("注册成功");
					},
					error : function(user, error) {
						// Show the error message somewhere and let the user try again.
						alert("失败: " + error.code + " " + error.message);
					}
				});
			}
		},
		cancelOnly : false
	});
}

//加载收藏商品
function CollectPanelLoad() {
	var currentUser = AV.User.current();
	if (currentUser) {
		AV.Cloud.run('getFavorite', {
			"userId" : currentUser.id
		}, {
			success : function(result) {
				$("#collect_panel ul").empty();
				$('#collect_panel #no_collect_tip_img_collect_panel').remove();
				for ( i = 0; i < result.length; i++) {
					var li = "<li id='" + result[i].objectId + "' ><div><img src='" + result[i].smallImage._url + "' /><div><p>" + result[i].name + "</p></div><img class='delete_collect_panel' src='images/delete.png' onclick='deleteCollect(this)' /></div></li>";
					$("#collect_panel ul").append(li);
				}
			},
			error : function(error) {
				$("#collect_panel ul").empty();
				if (!$('#collect_panel #no_collect_tip_img_collect_panel').attr('src')) {
					var img = "<img id='no_collect_tip_img_collect_panel' src='images/no_collect.png' />";
					$("#collect_panel > div").append(img);
				}
			}
		});
	} else {
		popup = loginPop();
	}
}

//加载购物车商品
function shoppingCartPanelLoad() {
	var currentUser = AV.User.current();
	if (currentUser) {
		AV.Cloud.run('getShoppingCart', {
			"itemIds" : shoppoingCart
		}, {
			success : function(result) {
				if (result.length == 0) {
					$("#shopping_cart_panel ul").empty();
					if ($('#shopping_cart_panel #no_shopping_cart_tip_img_collect_panel').length == 0) {
						var img = "<img id='no_shopping_cart_tip_img_collect_panel' src='images/no_shopping_cart_item.png' />";
						$("#shopping_cart_panel > div").append(img);
					}
				} else {
					$("#shopping_cart_panel ul").empty();
					$('#shopping_cart_panel #no_shopping_cart_tip_img_collect_panel').remove();
					for ( i = 0; i < result.length; i++) {
						var li = "<li " + "data-price='" + result[i].price + "' data-id='" + result[i].objectId + "'><div><img src='" + result[i].smallImage._url + "' /><div><p>" + result[i].name + "</p><p>" + result[i].price + "元</p></div><img class='delete_shopping_cart_panel' src='images/delete.png' onclick='deleteShoppingCart(this)' /></div><div>我要买<img src='images/minus.png' onclick='changeItem(this,0)'/><span>1</span><img src='images/plus.png' onclick='changeItem(this,1)' />件</div></li>";
						$("#shopping_cart_panel ul").append(li);
					}
					changePrice();
				}
			},
			error : function(error) {
			}
		});
	} else {
		popup = loginPop();
	}
}

//购物车加减件数
function changeItem(node, flag) {
	if (flag == 0) {
		var num = $(node).next().html();
		if (num > 1) {
			$(node).next().html(--num);
			changePrice();
		}
	}
	if (flag == 1) {
		var num = $(node).prev().html();
		$(node).prev().html(++num);
		changePrice();
	}
}

//购物车计算总价
function changePrice() {
	var count = 0;
	for ( i = 0; i < $("#shopping_cart_panel ul li").length; i++) {
		var $li = $("#shopping_cart_panel ul li").eq(i);
		var value = $li.attr('data-price');
		var piece = parseInt($li.find("span").html());
		count += value * piece;
	}
	$("#navbar  footer p span").html(count);
}

//下单处理函数
function placeOrder() {
	if (shoppoingCart.length == 0) {
		popup = af("#afui").popup("您的购物车内没有任何物品");
	} else {
		var currentUser = AV.User.current();
		var Order = AV.Object.extend("Order");
		var order = new Order();
		order.set("userId", currentUser.id);
		order.set("state", 1);
		order.set("location", new AV.GeoPoint({
			latitude : 31.717531,
			longitude : 118.787853
		}));
		order.save().then(function(order) {
			var OrderDetail = AV.Object.extend("OrderDetail");
			var orderDetail = new OrderDetail();
			orderDetail.set("orderId", order.id);
			for (var i = 0; i < shoppoingCart.length; i++) {
				var $li = $("#shopping_cart_panel ul li").eq(i);
				orderDetail.set("itemId", $li.attr("data-id"));
				orderDetail.set("piece", parseInt($li.find("span").html()));
				orderDetail.save().then(function(order) {
					result(i, "ok");
				}, function(order, error) {
					result(i, "error");
				});
			}
		}, function(order, error) {
			popup = af("#afui").popup("下单失败");
		});
	}
}

//下单结果
function result(id, result) {
	orderCount++;
	results[id] = result;
	var flag = true;
	if (orderCount == shoppoingCart.length) {
		for (var i; i < orderCount; i++) {
			if (results[i] == "error") {
				flag = false;
				var Item = AV.Object.extend("Item");
				var query = new AV.Query(Item);
				query.get(shoppoingCart[i]).then(function(item) {
					popup = af("#afui").popup(item.name + "下单失败");
				}, function(object, error) {
					popup = af("#afui").popup("下单失败，请联系QQ:2815859682");
				});
			}
		}
		if (flag) {
			results.length = 0;
			orderCount = 0;
			popup = af("#afui").popup("下单成功，请等待送货");
			//清空购物车 清空视图层
			shoppoingCart.length = 0;
			shoppingCartPanelLoad();
		}
	}
}

//删除购物车函数
function deleteShoppingCart(node) {
	for ( i = 0; i < shoppoingCart.length; i++) {
		if ($(node).parent().parent().attr('data-id') == shoppoingCart[i]) {
			shoppoingCart.splice(i, 1);
		}
	}
	$(node).parent().parent().remove();
	if ($('#shopping_cart_panel #no_shopping_cart_tip_img_collect_panel').length == 0) {
		var img = "<img id='no_shopping_cart_tip_img_collect_panel' src='images/no_shopping_cart_item.png' />";
		$("#shopping_cart_panel > div").append(img);
	}
	changePrice();
}

//删除收藏函数
function deleteCollect(node) {
	var currentUser = AV.User.current();
	var Favorite = AV.Object.extend("Favorite");
	var query = new AV.Query(Favorite);
	query.equalTo("userId", currentUser.id);
	query.equalTo("itemId", $(node).parent().parent().attr('id'));
	query.find().then(function(favorite) {
		AV.Object.destroyAll(favorite);
		$(node).parent().parent().remove();
	}, function(favorite, error) {
		popup = af("#afui").popup("失败");
	});
}

//反馈框
function fadeBackPop() {
	var currentUser = AV.User.current();
	if (currentUser) {
		popup = af("#afui").popup({
			title : "用户反馈",
			message : "内容: <textarea id='fade_back_content' rows='10' cols='30' style='webkit-text-security:disc;height:200px;' ></textarea>",
			cancelText : "取消",
			cancelCallback : function() {
			},
			doneText : "反馈",
			doneCallback : function() {
				if ($("#fade_back_content").val() == "")
					alert("请输入内容");
				else {
					var FadeBack = AV.Object.extend("FadeBack");
					var fadeBack = new FadeBack();
					fadeBack.set("userId", currentUser.id);
					fadeBack.set("content", $("#fade_back_content").val());
					fadeBack.save().then(function(fadeBack) {
						popup = af("#afui").popup("反馈成功");
					}, function(fadeBack, error) {
						popup = af("#afui").popup("反馈失败");
					});
				}
			},
			cancelOnly : false
		});
	} else {
		popup = loginPop();
	}
}

//关于我们
function aboutPop() {
	popup = af("#afui").popup("艺术家团队是南京邮电大学通达学院一支大学生创业团队，立志为您打造不一样的网上购物体验，我们后续还会推出除食品外的其它商品，让您足不出户，买遍全城。联系QQ：2815859682");
}

