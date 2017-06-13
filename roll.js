  const remote = require('electron').remote;
  const {ipcRenderer} = require('electron');
  const main = remote.require('./index.js');

  function createStr(item, price, i) {
    return '<tr> <td>'+item+'</td> <td>'+price+'</td> </tr>'
  }

  function submitroll(){
    var data = document.getElementById('roll').value;
    main.saveroll(data);
  }

  function editItems(){
    ipcRenderer.send('navigate','updateItems')
  }

  ipcRenderer.send('getitems','');

  ipcRenderer.on('giveitems', (event,items) => {
    var itemlist = '';
    len = items.length;
    for(var i = 0; i < len; i++) {
      itemlist = itemlist + createStr(items[i][0],items[i][1],i);
    }
    document.getElementById('itemlist').innerHTML = itemlist;
  });
