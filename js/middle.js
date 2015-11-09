middle = (function () {
   'use strict';
   var configMap = {
      main_html : String()
         + '<div class="header"></div>'
         + '<div class="field">'
         + '<canvas class="canvas" id="gps" width="800" height="1100"></canvas></div>',
      smallBoxSize : 25,
      maxAngle : 0,
      zoom : 0
   },
   field = new Array(),
   lines = new Array(),
   stateMap = {
		$container : {},
      canvas : {},
      ctx : {}
	},
	jqueryMap = {
		$field : {},
      $header : {}
	};

   //Нахождение угла возле точки x2, y2
   var angle = function (p1, p2, p3) {
      var x1 = p1.x, y1 = p1.y,
          x2 = p2.x, y2 = p2.y,
          x3 = p3.x, y3 = p3.y,
          a,b,c, aSQ, bSQ, cSQ, ang;
          aSQ = Math.pow((x2-x1),2) + Math.pow((y2-y1),2),
          bSQ = Math.pow((x3-x2),2) + Math.pow((y3-y2),2),
          cSQ = Math.pow((x3-x1),2) + Math.pow((y3-y1),2),
          a = Math.sqrt(aSQ),
          b = Math.sqrt(bSQ),
          c = Math.sqrt(cSQ),
          ang = 180-Math.acos((aSQ + bSQ - cSQ)/(2*a*b))*180/Math.PI;
          if (!ang) ang = 0;

      return {
         ang : ang,
         a : a,
         b : b
      }
   }

   var kosoe = function (p1, p2, p3) {
      var x1, y1, x2, y2;
         x1 = p2.x-p1.x,
         y1 = p2.y-p1.y,
         x2 = p3.x-p2.x,
         y2 = p3.y-p2.y;
      return (x1*y2 - x2*y1);//*10000;
   }

   var opuklost = function (p1, p2, p3, p4) {
      var kos1, kos2, kos3, kos4, vypuk;
      kos1 = kosoe(p1,p2,p3);
      kos2 = kosoe(p2,p3,p4);
      kos3 = kosoe(p3,p4,p1);
      kos4 = kosoe(p4,p1,p2);
      vypuk = ((kos1 > 0)&(kos2 > 0)&(kos3 > 0)&(kos4 > 0) || 
               (kos1 < 0)&(kos2 < 0)&(kos3 < 0)&(kos4 < 0));
      return vypuk;
   }

   //Очистка трекинга
   var clear = function () {
      var i, first, second, theard, forth = 2, p, alf, alf3, s, 
      dt = 1;// dt - дельта t

      clearField();

      for (i = 0; i < db.data.x.length-2; i++) {
         forth++;
         theard = forth - 1;
         second = theard - 1;
         first = second - 1;

         p = [{
            x : db.data.x[first],
            y : db.data.y[first]
         },{
            x : db.data.x[second],
            y : db.data.y[second]
         },{
            x : db.data.x[theard],
            y : db.data.y[theard]
         },{
            x : db.data.x[forth],
            y : db.data.y[forth]
         }];

         alf3 = angle(p[1], p[2], p[3]);
         //Просуммировать расстояние и поделить на dt

         if (i == 0) {
            alf = angle(p[0], p[1], p[2]).ang;
            s = 0;
         }
         if (opuklost(p[0], p[1], p[2], p[3])) {
            alf += alf3.ang;
         } else {
            alf -= alf3.ang;
         }
         s += alf3.a*10000;

         if (Math.abs(alf) > 360) {
            if (alf > 0) alf -= 360;
            if (alf < 0) alf += 360;
         }

         if ((Math.abs(alf) > configMap.maxAngle) && (s > configMap.zoom)) {
            drawPoint(p[2].x, p[2].y, 1);
            alf = angle(p[0], p[1], p[2]).ang;
            s = 0;
            dt = 1;
         } else {
            drawPoint(p[2].x, p[2].y, 2);
            dt += 1;
         }
      }
   }

   //Рисование точек
   var drawPoint = function(x, y, type) {
      var size;
      //x = Math.ceil((x-50.512)*20000)+400;
      //y = Math.ceil((y-30.629)*20000)+850;
      x = Math.ceil((x-50.512)*20000)+200;
      y = Math.ceil((y-30.629)*20000)+850;
        
         switch (type) {
            case 1: stateMap.ctx.fillStyle = "rgb(200,0,0)"; size = 4; break;
            case 2: stateMap.ctx.fillStyle = "rgb(0,0,200)"; size = 2; break;
         }
        stateMap.ctx.fillRect (x, y, size, size);

   }

   //Очистка всего поля
   var clearField = function () {
      stateMap.ctx.clearRect(0, 0, 800, 1100); // Очистка всего холста 
   }

   //Зададим поле
   var setJqueryMap = function () {
      var $container = stateMap.$container;
      jqueryMap.$header = $container.find('.header');
      jqueryMap.$field = $container.find('.field');
   }

   //Задание конфигурации
   var setConfigMap = function (options) {
      configMap.maxAngle = parseInt(options.maxAngle, 10);
      configMap.zoom = parseInt(options.zoom, 10);
   }

   //Инит модуля
   var initModule = function ( $container ) {
      $container.append( configMap.main_html );
      stateMap.$container = $container;
      stateMap.canvas = document.getElementById("gps");
      stateMap.ctx = stateMap.canvas.getContext("2d");
      setJqueryMap();

   }

   //Инит поля
   var initField = function (options) {
      setConfigMap(options);
      clear();
   }

   return {
      initModule  : initModule,
      initField : initField,
      clearField : clearField
   }

}());