//加载商品
function loadItem(Items) {
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
		//var test =
		var setItem = "localStorage.setItem('itemId', " + "'" + Items[i].objectId + "'" + ")";
		$a.attr("href", "#buy_panel");
		$a.attr('onclick', setItem);
		$li.append($a);
		$("#main_panel ul").append($li);
	}
}

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

function collect() {
	var currentUser = AV.User.current();
	if (currentUser) {
		var Favoraite = AV.Object.extend("Favoraite");
		var favoraite = new Favoraite();
		favoraite.set("userId", currentUser.get("objectId"));
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
		loginPop();
	}
}

function loginPop() {
	af("#afui").popup("I'm replacing an alert box");
}

