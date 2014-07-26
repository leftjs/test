//popup对话框对象
var popup;
//购物车集合
var shoppoingCart = new Array();

//加载主页商品
function loadItemMainPanel(Items) {
	var geo = new AV.GeoPoint({
		latitude : 31.717531,
		longitude : 118.787853
	});
	for ( i = 0; i < Items.length; i++) {
		var $span = ("<span>" + "距您" + geo.kilometersTo(Items[i].location).toFixed(2) + "km" + "</span>");
		var $p2 = $("<p></p>");
		$p2.attr("class", "item_description");
		$p2.append(Items[i].shopName, $span);
		var $p1 = $("<p></p>");
		$p1.css("font-size", "25px");
		$p1.append(Items[i].name);
		var $div = $("<div></div>");
		$div.append($p1, $p2);
		var $img = $("<img></img>");
		$img.attr("src", Items[i].smallImage._url);
		var $li = $("<li></li>");
		var $a = $("<a></a>");
		$a.append($img, $div);
		var setItem = "localStorage.setItem('itemId', " + "'" + Items[i].objectId + "'" + ")";
		$a.attr('onclick', setItem);
		$a.attr("href", "#buy_panel");
		$a.attr("data-transition", "pop");
		$li.append($a);
		$("#main_panel ul").append($li);
	}
}

//初始化广告
function initAdvertise() {
	var ad = AV.Object.extend("Advertise");
	var query = new AV.Query(ad);
	query.descending("updatedAt");
	query.limit(4);
	query.find({
		success : function(results) {
			for (var i = 0; i < results.length; i++) {
				var $img = $("<img></img>");
				$img.attr("src", results[i].get("picture").url());
				$("#slider").append($img);
			}
			$('#slider').nivoSlider();
		},
		error : function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
}

//加载购买面板
function buyPanelLoad() {
	var imageUrl;
	var description;
	var itemName;
	var price;
	var item = AV.Object.extend("Item");
	var query = new AV.Query(item);
	query.get(localStorage.getItem('itemId'), {
		success : function(item) {
			// The object was retrieved successfully.
			$("#buy_panel #item_pic_big").attr('src', item.get('bigImage').url());
			$("#buy_panel #item_name").html(item.get("name"));
			$("#price_detail span").html(item.get("price"));
			$("#buy_panel #description").html(item.get("description"));
		},
		error : function(object, error) {
			alert("加载失败" + error.message);
		}
	});
}

//收藏
function collect() {
	var currentUser = AV.User.current();
	if (currentUser) {
		var Favoraite = AV.Object.extend("Favorite");
		var favoraite = new Favoraite();
		favoraite.set("userId", currentUser.id);
		favoraite.set("itemId", localStorage.getItem('itemId'));
		favoraite.save(null, {
			success : function(favoraite) {
				// Execute any logic that should take place after the object is saved.
				alert('New object created with objectId: ' + favoraite.id);
			},
			error : function(favoraite, error) {
				// Execute any logic that should take place if the save fails.
				// error is a AV.Error with an error code and description.
				alert('Failed to create new object, with error code: ' + error.description);
			}
		});
	} else {
		// show the signup or login page
		popup = loginPop();

	}
}

//加入购物车
function addToShoppingCart() {
	var currentUser = AV.User.current();
	if (currentUser) {
		shoppoingCart.push(localStorage.getItem('itemId'));
	} else {
		// show the signup or login page
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
					alert("成功");
				},
				error : function(user, error) {
					// The login failed. Check error to see why.
					alert(error.message);
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
				//	user.set("location", Geolocation);
				//	user.set("adress", Adress);

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
				alert(1);
			},
			error : function(error) {
				alert(error.message);
			}
		});
	} else {
		$("#collect_panel ul").remove();
		if (!$('#collect_panel #no_collect_tip_img_collect_panel').attr('src')) {
			var img = "<img id='no_collect_tip_img_collect_panel' src='images/no_collect.png' />";
			$("#collect_panel > div").append(img);
		}
	}
}

function placeOrder() {
	if (shoppoingCart.length == 0) {
		af("#afui").popup("您的购物车内没有任何物品");
	} else {
		AV.Cloud.run('placeOrder', {
			"latitude" : 31.717531,
			"longitude" : 118.787853,
			"userId" : AV.User.current().id,
			"items" : shoppoingCart
		}, {
			success : function(result) {
				af("#afui").popup("下单成功，请等待送货");
			},
			error : function(error) {
				alert(error.message);
			}
		});
	}
}

