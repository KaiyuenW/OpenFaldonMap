var SHOW_ALL=-1, SHOW_MONSTERS=-2, SHOW_VENDORS=-3, SHOW_FLOWERS=-4;

var flowerSpawnData = new Array();
var spawnData = new Array();
var monsterData = new Array();
var names = new Object();
const vendors=['10','20','65','66','133','154','158','162'];

var mapWidth = 4096;
var mapHeight = 2048;
var app;
//map is 4x size of original
var tileHeight = 1;
var tileWidth = 4;

var osConfig, anno, viewer, db = {};
var selectedMob;
var currentMap = "7";

function selectMonster(monsterId) {
	selectedMob = monsterId;

	var mapsWithMob = new Array();
	
	for(var i = 0; i < spawnData.length; i++) {
		var spawn = spawnData[i];
		
		if(spawn.monster == selectedMob) {
			var inlist = false;
			for(var m = 0; m < mapsWithMob.length; m++) {
				if(mapsWithMob[m] == spawn.map) {
					inlist = true;
					break;
				}
			}
			
			if(!inlist) {
				mapsWithMob.push(spawn.map);
			}
		}
  }
  clearSpawns();
  if(selectedMob==SHOW_FLOWERS){
    drawFlowers(currentMap);
  }else drawSpawns(currentMap, selectedMob);
	var sel = document.monster_form.map_select;
	sel.options.length = 0;
    
  if(selectedMob > 0){	
      
      var mobOnCurrentMap = false;
      for(var i = 0; i < mapsWithMob.length; i++) {
          var map = mapsWithMob[i];
          
          if(map == currentMap){
              mobOnCurrentMap = true;
          }
          
          sel.options[sel.options.length] = new Option("Map " + map, map, false, false); 
      }

      if(mobOnCurrentMap){        
          $("#map_select").val(currentMap);
      }else{
          currentMap = sel.options[0].value;
          selectMap(currentMap);
      }
  }else{
      for(var i = 1; i <= 9; i++){
          var currentOption = sel.options.length;
          sel.options[currentOption] = new Option("Map "+i, i, false, false);
      }
      $("#map_select").val(currentMap);
  }
}

function loadMonsters() {
	$.get("monsters.txt", function(data) {
		var lines = data.split("\n");
		
		for(var i = 0; i < lines.length; i++) {
			var mData = lines[i].split(",");
			
			var monster = new Object();
			monster.id = mData[0];
			monster.name = mData[1];
			
			monsterData.push(monster);	
			names[monster.id] = monster.name;
		}
		
		var sel = document.monster_form.monster_select;
		sel.options.length = 0;
		
		for(var i = 0; i < monsterData.length; i++) {
			var monster = monsterData[i];
			
			sel.options[sel.options.length] = new Option(monster.name, monster.id, false, false);
		}
	});
}

function loadSpawns() {
	$.get("monster-spawns.txt", function(data) {
		var lines = data.split("\r\n");
		
		for(var i = 0; i < lines.length; i++) {
			var sData = lines[i].split(",");
			
			var spawn = new Object();
			
			spawn.x = sData[0];
			spawn.y = sData[1];
			spawn.z = sData[2];
			spawn.map = sData[3];
			spawn.monster = sData[4];
			if(sData.length>5) spawn.name = sData[5];
			
			spawnData.push(spawn);
		}
	});
	
	$.get("flower-spawns.txt", function(data) {
		var lines = data.split("\r\n");
		
		for(var i = 0; i < lines.length; i++) {
			var sData = lines[i].split(",");
			
			var spawn = new Object();
			
			spawn.map = sData[0];
			spawn.x = sData[1];
			spawn.y = sData[2];
			spawn.z = sData[3];
			
			flowerSpawnData.push(spawn);
		}
	});
}


function drawSpawns(mapNr, monsterId) {	
	for(var i = 0; i < spawnData.length; i++) {
		var spawn = spawnData[i];
		if(spawn.map != mapNr)continue;
		if(monsterId==SHOW_VENDORS && !vendors.includes(spawn.monster)) continue;
		else if(monsterId==SHOW_MONSTERS && vendors.includes(spawn.monster)) continue;
		else if(monsterId>=0 && spawn.monster != monsterId) continue;
		
		var x = parseInt(spawn.x);
		var y = parseInt(spawn.y);
		
		var sx = (x - y) * tileWidth;
		sx += mapWidth/2;
    var sy = (x + y) * tileHeight;
    var vx = sx/mapWidth; //viewport x
    var vy = sy/mapHeight; //viewport y

    var elem = document.createElement("div");
    var svg_img = document.createElement("div");
    //svg_img.src = "images/Down_arrow_red.svg";
    svg_img.classList.add('spawn-pointer');
    
		//if(vendors.includes(spawn.monster)) svg_img.style.filter = 'invert(1)';
		//else svg_img.style.filter = 'hue-rotate('+spawn.monster*20+'deg)';
    
    
		svg_img.style.filter = 'hue-rotate('+spawn.monster*20+'deg)';
    if(spawn.monster%2==0) svg_img.style.filter += ' invert(1) brightness(80%)';
    //if(spawn.monster%3==1) svg_img.style.filter += ' invert(1)';
      
    var span = document.createElement("span");
    span.classList.add('tooltip');
		if(spawn.name) span.innerText=spawn.name;
		else span.innerText=names[spawn.monster];
    svg_img.appendChild(span);
		
		elem.id = "spawn"+i;
    elem.appendChild(svg_img)
    viewer.addOverlay(elem, new OpenSeadragon.Point(vx, vy));
	}
}

function clearSpawns(){

    viewer.clearOverlays();
}

function drawFlowers(mapNr) {	
	for(var i = 0; i < flowerSpawnData.length; i++) {
		var spawn = flowerSpawnData[i];
		if(spawn.map != mapNr)continue;
		
		var x = parseInt(spawn.x);
		var y = parseInt(spawn.y);
		
		var sx = (x - y) * tileWidth;
		sx += mapWidth/2;
    var sy = (x + y) * tileHeight;
    var vx = sx/mapWidth; //viewport x
    var vy = sy/mapHeight; //viewport y

    var elem = document.createElement("div");
    var svg_img = document.createElement("div");
    svg_img.classList.add('spawn-pointer');
    
    var span = document.createElement("span");
    span.classList.add('tooltip');
		span.innerText="("+spawn.x+","+spawn.y+","+spawn.z+")";
    svg_img.appendChild(span);
		
		elem.id = "spawn"+i;
    elem.appendChild(svg_img)
    viewer.addOverlay(elem, new OpenSeadragon.Point(vx, vy));
	}
}

var findById = function(id) {
        var query = db.collection('annotations').where('id', '==', id);
        return query.get().then(function(querySnapshot) {
            var doc = querySnapshot.docs[0];
            return doc
        });
    }

function startViewport(){
 
    osConfig = {
        id:            "faldon-map",
        showNavigator: true,
        navigatorPosition: "BOTTOM_LEFT",
        prefixUrl: "images/",
        toolbarDiv: "toolbar-div",
        tileSources:   [{
            type: 'image',
            url:  'map/map_1.png',
            buildPyramid: false
        },{
            type: 'image',
            url:  'map/map_2.png',
            buildPyramid: false
        },{
            type: 'image',
            url:  'map/map_3.png',
            buildPyramid: false
        },{
            type: 'image',
            url:  'map/map_4.png',
            buildPyramid: false
        },{
            type: 'image',
            url:  'map/map_5.png',
            buildPyramid: false
        },{
            type: 'image',
            url:  'map/map_6.png',
            buildPyramid: false
        },{
            type: 'image',
            url:  'map/map_7.png',
            buildPyramid: false
        },{
            type: 'image',
            url:  'map/map_8.png',
            buildPyramid: false
        },{
            type: 'image',
            url:  'map/map_9.png',
            buildPyramid: false
        }
    ]
    }

    viewer = OpenSeadragon(osConfig);

    var config = {
        widgets: [
            'COMMENT',
            { widget: 'TAG',
                vocabulary: [    "monster",
                            "npc",
                            "religion",
                            "easy",
                            "medium",
                            "hard",
                            "portal"]
            }
            ]
        };
    anno = OpenSeadragon.Annotorious(viewer,config);
    map = document.getElementById('faldon-map');
    //loadAnnotations();
}

function loadAnnotations(){    
    anno.setAnnotations({});
    // Load annotations for this image
    db.collection('annotations').where('target.source', '==', currentMap)
    .get().then(function(querySnapshot) {
        if(querySnapshot.docs.length > 0){ 
           var annotations = querySnapshot.docs.map(function(doc) { 
                return doc.data(); 
            });
        }else{
            annotations = {};
        }

        anno.setAnnotations(annotations);
    });

}

function selectMap(mapNum){
    currentMap = mapNum;
    viewer.goToPage(mapNum-1);
    
    if(selectedMob==SHOW_FLOWERS){
      drawFlowers(currentMap);
    }else drawSpawns(currentMap, selectedMob);
}

function startApp(){ 
    startViewport();
    loadMonsters();
    loadSpawns();
    selectMonster(0);
    selectMap(currentMap);


    $("#monster_select").change(function(evt){
        selectMonster(this.value);
    });

    $("#map_select").change(function(evt){
        selectMap(this.value);
    });

}

function tagSearch(){
    var searchstr = document.getElementById("searchstr").value;
    console.log(searchstr);
    var results = db.collection('annotations').where('body', 'array-contains-any', 
                [{  purpose: 'tagging',
                    type: 'TextualBody',
                    value: searchstr
                    }]).get()
        .then(function(querySnapshot){
        var annotations = querySnapshot.docs.map(function(doc) {
            console.log(doc.data());
            return doc.data();
        });
        anno.setAnnotations(annotations);
    });
                        
}


window.onload = function() {
    startApp();
}
function findByField(dbField, objField) {
        var query = db.collection('annotations').where(dbField, '==', objField);
        return query.get().then(function(querySnapshot) {
            var doc = querySnapshot.docs;
            return doc
        });
    }
