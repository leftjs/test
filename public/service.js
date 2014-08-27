function P2P() {
	popup = af("#afui").popup({
		title: "懒了救急服务",
		message: "请确认您的手机号: <input id='phone_number_service' type='text'>",
		cancelText: "取消",
		cancelCallback: function() {},
		doneText: "确定",
		doneCallback: function() {
			popup = af("#afui").popup("确认完成。请保持手机畅通，几分钟后我们会有专人联系你。")
		},
		cancelOnly: false
	});
}

function changeBulb() {
	popup = af("#afui").popup({
		title: "懒了换灯泡",
		message: "请输入灯泡参数(尺寸，安装方式，节能or不节能，功率,不使用默认地址，请注明新地址): <textarea id='phone_number_service' type='text' rows='10' cols='30'></textarea>",
		cancelText: "不换",
		cancelCallback: function() {},
		doneText: "换了",
		doneCallback: function() {
			popup = af("#afui").popup("确认完成。请保持手机畅通，几分钟后我们会有专人联系你。")
		},
		cancelOnly: false
	});
}

function addService() {
	popup = af("#afui").popup({
		title: "懒了自定义",
		message: "请用最简洁的语言描述一下您的需求，我们会在两个工作日内为您处理<textarea type='text' rows='10' cols='30'></textarea>",
		cancelText: "取消",
		cancelCallback: function() {},
		doneText: "提交",
		doneCallback: function() {
			popup = af("#afui").popup("确认完成。请保持手机畅通，几分钟后我们会有专人联系你。")
		},
		cancelOnly: false
	});
}