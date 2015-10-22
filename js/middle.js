middle = (function () {
   'use strict';
   var configMap = {
      main_html : String()
         + '<div class="header"></div>'
         + '<div class="field">'
         + '<canvas class="canvas" id="gps" width="800" height="900"></canvas></div>',
      smallBoxSize : 25,
      maxAngle : 0
   },
   field = new Array(),
   lines = new Array(),
   stateMap = {
		$container : {},
      canvas : {}
	},
	jqueryMap = {
		$field : {},
      $header : {}
	};

   //Нахождение угла возле точки x2, y2
   var angle = function (p1, p2, p3, dt, lastAng) {
      var x1 = p1.x, y1 = p1.y,
          x2 = p2.x, y2 = p2.y,
          x3 = p3.x, y3 = p3.y,
          a,b,c, ang, res, f;
          if (!dt || dt < 0) dt = 1;
          var 
          aSQ = Math.pow((x2-x1),2) + Math.pow((y2-y1),2),
          bSQ = Math.pow((x3-x2),2) + Math.pow((y3-y2),2),
          cSQ = Math.pow((x3-x1),2) + Math.pow((y3-y1),2),
          a = Math.sqrt(aSQ),
          b = Math.sqrt(bSQ),
          c = Math.sqrt(cSQ),
          ang = Math.acos((aSQ + bSQ - cSQ)/(2*a*b))*180/Math.PI;
          a = a*100;
          b = b*100;
          c = c*100;
          //if (res > 180) res = 0;
          ang = 180 - ang;
          f = 1000*(a+b)/dt;
          //ang = Math.abs(lastAng - ang)/(f+1);
          res = f*ang;
          console.log(ang.toFixed(2) + " " + f.toFixed(2) + " " + res.toFixed(2) + " " + dt);
          
      return res;
   }

   //Очистка трекинга
   var clear = function () {
      var i, first = 0, second = 1, theard = 2, p1, p2, p3, ang = 0,
      dt;// dt - дельта t
      for (i = 0; i < db.data.x.length-2; i++) {

         p1 = {
            x : db.data.x[first],
            y : db.data.y[first]
         };
         p2 = {
            x : db.data.x[second],
            y : db.data.y[second]
         };
         p3 = {
            x : db.data.x[theard],
            y : db.data.y[theard]
         };
         dt = theard-first;
         ang = angle(p1, p2, p3, dt, ang);
         if (ang > configMap.maxAngle) {
            first = theard-1;
            second = theard;
            drawPoint(p3.x, p3.y, 1);
         } else {
            second = Math.ceil((first + theard + 1)/2);
            drawPoint(p3.x, p3.y, 2);
         }
         theard++;
      }
   }

   //Рисование точек
   var drawPoint = function(x, y, type) {
      var size;
      x = Math.ceil((x-50.512)*20000)+400;
      y = Math.ceil((y-30.629)*20000)+850;

        var ctx = stateMap.canvas.getContext("2d");
         switch (type) {
            case 1: ctx.fillStyle = "rgb(200,0,0)"; size = 5; break;
            case 2: ctx.fillStyle = "rgb(0,0,200)"; size = 2; break;
         }
        ctx.fillRect (x, y, size, size);

   }

   //Очистка всего поля
   var clearField = function () {
      var ctx = stateMap.canvas.getContext("2d");
      ctx.clearRect(0, 0, 800, 900); // Очистка всего холста 
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
   }

   //Инит модуля
   var initModule = function ( $container ) {
      $container.append( configMap.main_html );
      stateMap.$container = $container;
      stateMap.canvas = document.getElementById("gps");
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