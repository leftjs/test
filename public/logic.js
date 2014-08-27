//popup对话框对象
var popup;
//购物车集合
var shoppoingCart = new Array();
//下单结果数组
var results = new Array();
//下单计数器
var orderCount = 0;
//手机号
var phoneNumber;
//路程对应价格数组
var freight = [6, 6, 6, 10, 10, 15, 15];
//公共位置数据
var userGeo;
//轮播插件
var carousel;
$(document).ready(function() {
	// 初始化 param1：应用 id、param2：应用 key
	AV.initialize("hhdpk5vytgtwbc5rkque9oyvfu5mto19ays24u5x5l0pk89j", "d2zsij0i0wwkax18mlo56xsak4my1da58dsza2npmxfyg6r9");
	userGeo = new AV.GeoPoint({
		latitude: 31.717531,
		longitude: 118.787853
	});
	$("#afui").get(0).className = 'ios7';
	/*-----------------初始化广告--------------------------*/
	initAdvertise();
	/*-----------------初始化地理位置--------------------------*/
	//geolocation.getCurrentPosition();
	//	if (navigator.geolocation) {
	//		navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
	//	} else {
	//		alert('It seems like Geolocation, which is required for this page, is not enabled in your browser. Please use a browser which supports it.');
	//	}
	getItemData();
	checkVersion();
});
/*function successFunction(position) {
latitude = position.coords.latitude;
longitude = position.coords.longitude;
-----------------初始化商品--------------------------
AV.Cloud.run('getItem', {
"latitude" : latitude,
"longitude" : longitude
}, {
success : function(result) {
loadItemMainPanel(result);
},
error : function(error) {
alert(error.message);
}
});
}
function errorFunction() {
alert("定位失败，请打开gps，并给予懒了足够的权限");
}
*/
//初始化轮播
function init_carousel() {
		carousel = af("#carousel").carousel({
			pagingDiv: "carousel_dots",
			pagingCssName: "carousel_paging2",
			pagingCssNameSelected: "carousel_paging2_selected",
			preventDefaults: false,
			wrap: true //Set to false to disable the wrap around
		});
	}
	//获取主页数据

function getItemData() {
	var Shop = AV.Object.extend("Shop");
	var Item = AV.Object.extend("Item");
	var innerQuery = new AV.Query(Shop);
	innerQuery.withinKilometers("location", userGeo, 6);
	var query = new AV.Query(Item);
	query.matchesQuery("shop", innerQuery);
	query.include("shop");
	query.find({
		success: function(items) {
			loadItemMainPanel(items);
		}
	});
}

//加载主页商品
function loadItemMainPanel(items) {
	for (var i = 0; i < items.length; i++) {
		var itemGeo = items[i].get("shop").get("location");
		var li = "<li><a data-transition='pop' data-freight='" + userGeo.kilometersTo(itemGeo).toFixed(2) + "' data-id='" + items[i].id + "' href='#buy_panel'><img src='" + items[i].get('smallImage').url() + "'><div><p>" + items[i].get('name') + "<span>" + items[i].get('price') + "元</span></p><p>" + items[i].get('shop').get('name') + "<span>距您" + userGeo.kilometersTo(itemGeo).toFixed(2) + "km</span></p></div></a></li>";
		$("#main_panel ul").append(li);
		$("#main_panel > div >  ul > li > a").eq(i).bind("click", function(e) {
			localStorage.setItem("itemId", $(e.currentTarget).attr("data-id"));
		});
	}
}

//初始化广告
function initAdvertise() {
	var advertise = AV.Object.extend("Advertise");
	var query = new AV.Query(advertise);
	query.descending("createdAt");
	query.equalTo("enable", true);
	query.limit(4);
	query.find().then(function(results) {
		for (var i = 0; i < results.length; i++) {
			var $img = $("<img></img>");
			$img.attr("src", results[i].get("picture").url());
			$("#carousel").append($img);
		}
		init_carousel();
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
		var Item = AV.Object.extend("Item");
		var query = new AV.Query(Item);
		query.get(localStorage.getItem('itemId'), {
			success: function(item) {
				var relation = currentUser.relation("favorite");
				relation.add(item);
				currentUser.save().then(function() {
					popup = af("#afui").popup("已收藏");
				}, function(err) {
					alert(err.message);
				});
			},
			error: function(object, error) {}
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
		for (i = 0; i < shoppoingCart.length; i++) {
			if (itemId == shoppoingCart[i]) {
				flag = true;
				popup = af("#afui").popup("您不需要重复添加");
				break;
			}
		}
		if (flag == false) {
			shoppoingCart.push(itemId);
			popup = af("#afui").popup({
				title: "添加成功",
				message: "您是否需要？",
				cancelText: "继续购买",
				cancelCallback: function() {},
				doneText: "前往付款",
				doneCallback: function() {
					af.ui.loadContent("#shopping_cart_panel", false, false, false);
				},
				cancelOnly: false
			});
		}
	} else {
		popup = loginPop();
	}
}

//登录框
function loginPop() {
	return af("#afui").popup({
		title: "用户登录",
		message: "手机号: <input id='phone_number_login' type='text' class='af-ui-forms'><br />密码: <input id='password_login' type='text' class='af-ui-forms' style='webkit-text-security:disc'><br />还没有账号？请<span style='font-size:25px;color:blue;' onclick='registerPop()'>点击注册</span>",
		cancelText: "取消",
		cancelCallback: function() {},
		doneText: "登录",
		doneCallback: function() {
			AV.User.logIn($("#phone_number_login").val(), $("#password_login").val(), {
				success: function(user) {
					// Do stuff after successful login.
					popup = af("#afui").popup("登录成功");
				},
				error: function(user, error) {
					// The login failed. Check error to see why.
					popup = af("#afui").popup("登录失败");
				}
			});
		},
		cancelOnly: false
	});
}

//注册框
function registerPop() {
	popup.hide();
	popup = af("#afui").popup({
		title: "用户注册",
		message: "手机号: <input id='phone_number_register' type='text' class='af-ui-forms'><br />密码: <input id='password_register' type='text' class='af-ui-forms' style='webkit-text-security:disc'><br />确认密码: <input id='password_confirm_register'  type='text' class='af-ui-forms' style='webkit-text-security:disc'>",
		cancelText: "取消",
		cancelCallback: function() {},
		doneText: "注册",
		doneCallback: function() {
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
					success: function(user) {
						// Hooray! Let them use the app now.
						alert("注册成功");
					},
					error: function(user, error) {
						// Show the error message somewhere and let the user try again.
						alert("失败: " + error.code + " " + error.message);
					}
				});
			}
		},
		cancelOnly: false
	});
}

//加载收藏商品
function CollectPanelLoad() {
	var currentUser = AV.User.current();
	if (currentUser) {
		var relation = currentUser.relation("favorite");
		relation.query().find().then(function(results) {
			if (results.length) {
				$("#collect_panel ul").empty();
				$('#collect_panel #no_collect_tip_img_collect_panel').remove();
				for (i = 0; i < results.length; i++) {
					var li = "<li data-id='" + results[i].id + "' ><a data-transition='pop' href='#buy_panel'><div><img src='" + results[i].get("smallImage").url() + "' /><div><p>" + results[i].get("name") + "</p></div><img class='delete_collect_panel' src='images/delete.png' onclick='deleteCollect(this);return false;' /></div></a></li>";
					$("#collect_panel ul").append(li);
					$("#collect_panel ul > li").eq(i).click(function(e) {
						localStorage.setItem("itemId", $(e.currentTarget).attr("data-id"));
					});
				}
			} else {
				$("#collect_panel ul").empty();
				if (!$('#collect_panel #no_collect_tip_img_collect_panel').attr('src')) {
					var img = "<img id='no_collect_tip_img_collect_panel' src='images/no_collect.png' />";
					$("#collect_panel > div").append(img);
				}
			}
		}, function(err) {
			log(err.message);
		});
	} else {
		popup = loginPop();
	}
}

//加载购物车商品
function shoppingCartPanelLoad() {
	var currentUser = AV.User.current();
	if (currentUser) {
		var Item = AV.Object.extend("Item");
		var query = new AV.Query(Item);
		query.include("shop");
		query.containedIn("objectId", shoppoingCart);
		query.find().then(function(results) {
			if (results.length == 0) {
				$("#shopping_cart_panel ul").empty();
				if ($('#shopping_cart_panel #no_shopping_cart_tip_img_collect_panel').length == 0) {
					var img = "<img id='no_shopping_cart_tip_img_collect_panel' src='images/no_shopping_cart_item.png' />";
					$("#shopping_cart_panel > div").append(img);
				}
			} else {
				$("#shopping_cart_panel ul").empty();
				$('#shopping_cart_panel #no_shopping_cart_tip_img_collect_panel').remove();
				for (i = 0; i < results.length; i++) {
					var li = "<li data-latitude='" + results[i].get('shop').get("location").latitude + "' data-longitude='" + results[i].get('shop').get("location").longitude + "'" + "data-price='" + results[i].get('price') + "' data-id='" + results[i].id + "'><div><img src='" + results[i].get('smallImage').url() + "' /><div><p>" + results[i].get('name') + "</p><p>" + results[i].get('price') + "元</p></div><img class='delete_shopping_cart_panel' src='images/delete.png' onclick='deleteShoppingCart(this)' /></div><div>我要买<img src='images/minus.png' onclick='changeItem(this,0)'/><span>1</span><img src='images/plus.png' onclick='changeItem(this,1)' />件</div></li>";
					$("#shopping_cart_panel ul").append(li);
				}
				changePrice();
			}
		}, function(error) {});
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
	for (i = 0; i < $("#shopping_cart_panel ul li").length; i++) {
		var $li = $("#shopping_cart_panel ul li").eq(i);
		var value = $li.attr('data-price');
		var piece = parseInt($li.find("span").html());
		var itemGeo = new AV.GeoPoint({
			latitude: $li.attr('data-latitude'),
			longitude: $li.attr('data-longitude')
		});
		if (Math.ceil(userGeo.kilometersTo(itemGeo)) <= 6)
			count = count + value * piece + freight[Math.ceil(userGeo.kilometersTo(itemGeo))];
		else
			popup = af("#afui").popup("程序崩溃，请联系QQ:2815859682");
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
			latitude: 31.717531,
			longitude: 118.787853
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
	for (i = 0; i < shoppoingCart.length; i++) {
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
	var Item = AV.Object.extend("Item");
	var query = new AV.Query(Item);
	query.get($(node).parent().parent().parent().attr('data-id'), {
		success: function(item) {
			var currentUser = AV.User.current();
			var relation = currentUser.relation("favorite");
			relation.remove(item);
			currentUser.save().then(function() {
				$(node).parent().parent().parent().remove();
			}, function(err) {
				popup = af("#afui").popup("失败");
				log(err.message);
			});
		},
		error: function(object, error) {
			log(error.message);
		}
	});
	$(node).parent().parent().bind("click", function() {
		return false;
	});
}

//反馈框
function fadeBackPop() {
	var currentUser = AV.User.current();
	if (currentUser) {
		popup = af("#afui").popup({
			title: "用户反馈",
			message: "内容: <textarea id='fade_back_content' rows='10' cols='30' style='webkit-text-security:disc;height:200px;' ></textarea>",
			cancelText: "取消",
			cancelCallback: function() {},
			doneText: "反馈",
			doneCallback: function() {
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
			cancelOnly: false
		});
	} else {
		popup = loginPop();
	}
}

//关于我们
function aboutPop() {
		popup = af("#afui").popup("艺术家团队是南京邮电大学通达学院一支大学生创业团队，立志为您打造不一样的网上购物体验，我们后续还会推出除食品外的其它商品，让您足不出户，买遍全城。联系QQ：2815859682");
	}
	//检查更新

function checkVersion() {
	var Version = AV.Object.extend("Version");
	var query = new AV.Query(Version);
	query.first().then(function(version) {
		if (version.get("code") > 1) {
			popup = af("#afui").popup({
				title: "需要更新",
				message: "更新内容:" + version.get("description"),
				cancelText: "取消",
				cancelCallback: function() {},
				doneText: "立即更新",
				doneCallback: function() {
					window.open("http://app.codenow.cn/app/appdetail/39", "_system");
				},
				cancelOnly: false
			});
		}
	}, function(error) {
		alert("Error: " + error.code + " " + error.message);
	});
}

//输出日志
function log(s) {
	console.log(s);
}