/* Boot: build the map and wire up settings once every pack has registered. */
renderMap();
initSettings();
if(document.fonts&&document.fonts.load){document.fonts.load('900 40px "M PLUS Rounded 1c"','АΩアカ').catch(()=>{});}
