$(document).ready(function(){$('<link rel="stylesheet" href="yved/style.css">').appendTo('head');var i=0;function yved(){i=1;$('.yved:nth-child('+i+')').fadeIn(600).delay(15000).fadeOut(600);}setTimeout(function(){setInterval(function(){i=i+1;if(i>10)i=1;$('.yved:nth-child('+i+')').fadeIn(600).delay(15000).fadeOut(600);},30000);yved();},10000);});