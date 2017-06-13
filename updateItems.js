const {ipcRenderer} = require('electron');

ipcRenderer.send('getitems','');

function createStr(item, price, i) {
  return '<tr> <td>'+item+'</td> <td> '+ price +' </td> <td><button onclick="deleteItem('+i+')" class="btn btn-danger btn-block">Delete</button> </td> </tr>';
}

ipcRenderer.on('giveitems', (event,items) => {
  var itemlist = '<tr> <td><input type="text" class="form-control" id="additem"/></td> <td><input type="text" class="form-control" id="addprice"/></td> <td><button onclick="addto()" class="btn btn-success btn-block">Add</button></td> </tr>';
  var len = items.length;
  for(var i = 0; i < len; i++) {
    itemlist = createStr(items[i][0],items[i][1],i) + itemlist;
  }
  document.getElementById('itemlist').innerHTML = itemlist;
});

function addto(){
  var toAddList = [];
  temp = document.getElementById('additem').value;
  toAddList.push(temp);
  temp = parseInt(document.getElementById('addprice').value);
  toAddList.push(temp);
  ipcRenderer.send('addtolist',toAddList);
}

function deleteItem(i){
  ipcRenderer.send('deleteItem',i);
}

ipcRenderer.on('done', (event)=>{
  location.reload();
});

function purchase(){
  ipcRenderer.send('navigate','additem');
}
