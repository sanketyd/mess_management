const {ipcRenderer} = require('electron');
var len;
var pricelist = [];
function createStr(item, price, i) {
  return '<tr> <td>'+item+'</td> <td>'+price+'</td> <td> <input type="text" class="form-control" value="0" id="item'+i+'"/> </td> <td><button onclick="increase('+i+')" class="btn btn-success btn-block">+</button></td><td><button onclick="decrease('+i+')"class="btn btn-danger btn-block">-</button></td></tr>'
}
ipcRenderer.send('geturl','');

ipcRenderer.on('giveurl', (event,url) => {
  document.getElementsByTagName("iframe")[0].setAttribute("src",url);
});

ipcRenderer.send('getitems','');

ipcRenderer.on('giveitems', (event,items) => {
  var itemlist = '';
  len = items.length;
  for(var i = 0; i < len; i++) {
    pricelist.push(items[i][1]);
    itemlist = itemlist + createStr(items[i][0],items[i][1],i);
  }
  document.getElementById('itemlist').innerHTML = itemlist;
});

function increase(i){
  document.getElementById('item'+i).value = parseInt(document.getElementById('item'+i).value) + 1;
}

function decrease(i){
  var temp = parseInt(document.getElementById('item'+i).value - 1);
  if(temp >= 0){
    document.getElementById('item'+i).value = temp;
  }
  else {return;}
}

function expense() {
  var total = 0;
  for(var i = 0; i < len; i++){
    temp = 'item'+i;
    total = total + pricelist[i]*document.getElementById(temp).value;
  }
  ipcRenderer.sendSync('update',total);
}

function purchase(){
  ipcRenderer.send('navigate','additem');
}
