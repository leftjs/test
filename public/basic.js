// JavaScript Document
//http://www.phonegap100.com/appapi.php?a=getThreadCate&callback=?

/*

$.jsonP({			
		url:'http://jsfiddle.net/echo/jsonp/?test=some+html+content&callback=?',	
		success:function(data){
			//$('#af23_content').html(data.test)						
			alert(data['test']);
				
		}
	});	


*/

//获取文章左侧的分类数据

function getPortalCate(){
	$.jsonP({		
			url:serverURL+'/appapi.php?a=getPortalCate&callback=?',	
			success:function(data){
				//$('#af23_content').html(data.test)	
				var portalCateStr='';
				var jsondata=data['result'];
				
				for(var i=0;i<jsondata.length;i++){
					//portalCateStr+='<li class="divider">'+jsondata[i].catname+'</li>';
					portalCateStr+="<li onclick=\"setItem('portal_list_catid','"+jsondata[i].catid+"')\">";	
					portalCateStr+='<a href="#article_list_panel">'+jsondata[i].catname+'</a></li>';
				 				
				}				
				$("#portalCateList").append(portalCateStr);
					
			}
		});			
}

//帖子分类
function getThreadCate(){
	$.jsonP({		
			url:serverURL+'/appapi.php?a=getThreadCate&callback=?',	
			//http://www.phonegap100.com/appapi.php?a=getThreadCate&callback=?
			success:function(data){				
				
				//alert(data['result'][0]['name']);
				//获取一级分类第一个的名称
				//console.log(data['result'][0]['name']+'111');
				//获取一级分类下的子分类的第一个分类名称
				//console.log(data['result'][0]['subcate'][0]['name']+'111');
				var jsondata=data['result'];
				var str='';
				for(var i=0;i<jsondata.length;i++){
					str+='<li class="divider">'+jsondata[i].name+'</li>';
					var subcatedata=jsondata[i]['subcate'];//获取二级分类						
					for(var j=0;j<subcatedata.length;j++){
						str+="<li onclick=\"setItem('forum_list_fid','"+subcatedata[j].fid+"')\">";
						str+='<a href="#forum_list_panel"><img class="forum_list_img" src="images/forum_new.gif" />'+subcatedata[j]['name']+'</a></li>';
												
					}
					
				}				
				$('#listForumCate').append(str);
			}
		});			
}
//forum list load
function list_panel_load(){
	var fid=getItem('forum_list_fid');
	
	var page=1;	
	var threadList='';
	
	$.jsonP({		
		url:serverURL+'/appapi.php?a=getThreadList&fid='+fid+'&page='+page+'&callback=?',	
		success:function(data){			
				
			var jsondata=data['result'];					
			//panel				
			for(var i=0;i<jsondata.length;i++){	
				threadList+="<li class='clearfix' onclick=\"setItem('thread_content_tid','"+jsondata[i].tid+"')\">";	
								
				threadList+='<a href="forum_content.html" data-refresh-ajax="true"><img src="images/user.gif" /><p>'+jsondata[i].subject+'</p></a></li>'									
			}			
			
			$("#threadList").append(threadList);
		}
	});	
	
	
	
}
//forum list unload
function list_panel_unload(){	
	$("#threadList").text('');	
	threadPage=2;	
	
}

//帖子加载更多
var threadPage=2;
function threadListmore(){
		var fid=getItem('forum_list_fid');				
		var threadList='';
		$.jsonP({		
			url:serverURL+'/appapi.php?a=getThreadList&fid='+fid+'&page='+threadPage+'&callback=?',	
			success:function(data){			
					
				var jsondata=data['result'];					
				//panel				
				for(var i=0;i<jsondata.length;i++){	
					threadList+="<li class='clearfix' onclick=\"setItem('thread_content_tid','"+jsondata[i].tid+"')\">";	
									
					threadList+='<a href="forum_content.html" data-refresh-ajax="true"><img src="images/user.gif" /><p>'+jsondata[i].subject+threadPage+'</p></a></li>'									
				}							
				$("#threadList").append(threadList);
				threadPage++;	
			}
		});	
	
	
	
}

//文章列表加载

function article_list_load(){
	
	
	var catid=getItem('portal_list_catid');	
	//alert(fid);
	var page=1;	
	var portalList='';
	//http://www.phonegap100.com/appapi.php?a=getPortalList&catid=20&page=2
	$.jsonP({		
		url:serverURL+'/appapi.php?a=getPortalList&catid='+catid+'&page='+page+'&callback=?',	
		success:function(data){			
				
			var jsondata=data['result'];					
			//panel				
			for(var i=0;i<jsondata.length;i++){	
				portalList+="<li class='clearfix' onclick=\"setItem('portal_content_aid','"+jsondata[i].aid+"')\">";					
				portalList+='<a href="portal_content.html" data-refresh-ajax="true"><img src="images/user.gif" /><p>'+jsondata[i].title+'</p></a></li>'									
			}	
			//alert(portalList);
			//alert(threadList);	
			$("#articleList").append(portalList);
		}
	});		
		
}

//文章列表不加载
function article_list_unload(){	
	$("#articleList").text('');		
	articlePage=2;
}
//点击加载更多文章
var articlePage=2;
function articleListmore(){
	var catid=getItem('portal_list_catid');	
	//alert(fid);
	var portalList='';
	//http://www.phonegap100.com/appapi.php?a=getPortalList&catid=20&page=2
	
	$.jsonP({		
		url:serverURL+'/appapi.php?a=getPortalList&catid='+catid+'&page='+articlePage+'&callback=?',	
		success:function(data){			
				
			var jsondata=data['result'];					
			//panel				
			for(var i=0;i<jsondata.length;i++){	
				portalList+="<li class='clearfix' onclick=\"setItem('portal_content_aid','"+jsondata[i].aid+"')\">";					
				portalList+='<a href="portal_content.html" data-refresh-ajax="true"><img src="images/user.gif" /><p>'+jsondata[i].title+''+articlePage+'</p></a></li>'									
			}	
			//alert(portalList);
			//alert(threadList);	
			$("#articleList").append(portalList);
			articlePage++;
		}
	});		
	
}

/*

 <li class="clearfix">
                            <a href="forum_content.html" data-refresh-ajax="true">        
                                <img src="images/user.gif" />                                                  
                                <p>主持人正在验国内最大</p> 
                            </a>
                        </li>

*/

