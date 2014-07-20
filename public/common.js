// JavaScript Document

//网站的主域名
var serverURL = 'http://www.phonegap100.com';

/*
写入loclstorage缓存
 * @param key
 * @param data
*/
function setItem(key,data){	
	localStorage.setItem(key,data);
}
/*
读取localstorage缓存
  * @param key 
  * @returns
*/
function getItem(key){
	return localStorage.getItem(key);
}

/*时间戳转换为 2011年3月16日 16:50:43 格式*/
function getDate(tm){
	var tt=new Date(parseInt(tm) * 1000).toLocaleString()
	return tt;
}