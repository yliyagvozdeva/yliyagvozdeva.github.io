(function(e){
	if(!("GS" in e)){
		e.GS={};
		
		GS.HOST = "http://vkontore.m2corp.ru";
		GS.DOMAIN = document.domain;
		GS.API = '/api/';
		GS.CALLBACK = 'callback=?';
		GS.VERSION = '';
		
		GS.addJs=function(a){			
			var hcc = document.createElement("script");
			hcc.type = "text/javascript";
			hcc.async = true;
			hcc.src = a;
			var s = document.getElementsByTagName("script")[0];			
			document.getElementsByTagName("head")[0].appendChild(hcc);			
		};
		
		GS.init=function(){							
			$.getJSON(GS.HOST + GS.API + 'getSite/?domain=' + GS.DOMAIN + '&' + GS.CALLBACK, function(data){						
				GS.addJs(GS.HOST + "/app/widget_" + data.siteId + GS.VERSION + ".js");
			});
		};	
		
		GS.init();	
	}	
})(window);
