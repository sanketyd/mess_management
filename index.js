const electron = require('electron');
const {app, BrowserWindow, ipcMain, Menu} = electron;
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./Data/extras.db')

const templete = [
  {
    label: 'Navigate',
    submenu: [
      {
        label: 'Home',
        click() {BrowserWindow.getFocusedWindow().loadURL(`file://${__dirname}/Templates/additem.html`);}
      },
      {
        label: 'Edit items',
        click() {BrowserWindow.getFocusedWindow().loadURL(`file://${__dirname}/Templates/updateItems.html`);}
      },
      {
        label: 'Generate CSV and Reset',
        click() { generateCsvAndReset(); }
      }
    ]
  }
]

const menu = Menu.buildFromTemplate(templete);
Menu.setApplicationMenu(menu);

app.on('ready',() => {
  let win = new BrowserWindow({width: 800, height: 600, icon: `${__dirname}/Data/icon.png`});
  win.loadURL(`file://${__dirname}/Templates/additem.html`);
  win.on('closed', () => {
    win = null;
  });
});

app.on('window-all-closed', () => {
  try{
    db.close();
  } catch(e) {}
  app.quit();
});

app.on('activate', () => {
  if (win === null) {
    let win = new BrowserWindow({width: 800, height: 600, icon: `${__dirname}/Data/icon.png`});
    win.loadURL(`file://${__dirname}/Templates/additem.html`);
    win.on('closed', () => {
      win = null;
    });
  }
})


exports.saveroll = (roll) => {
  rollno = roll;
  BrowserWindow.getFocusedWindow().loadURL(`file://${__dirname}/Templates/main.html`);
  return;
}

ipcMain.on('navigate',(event,args) => {
  try {delete rollno;} catch(err) {console.log(err);}
  BrowserWindow.getFocusedWindow().loadURL(`file://${__dirname}/Templates/`+args+`.html`);
});

ipcMain.on('geturl', (event,args) => {
  url = 'http://oa.cc.iitk.ac.in:8181/Oa/Jsp/OAServices/IITk_SrchRes.jsp?typ=stud&numtxt='+ rollno +'&sbm=Y'
  event.sender.send('giveurl',url);
});

ipcMain.on('getitems', (event,args) => {
  var day = new Date().getDay();
  var time = new Date().getHours();
  var obj = fs.readFileSync('./Data/items.json','utf-8');
  obj = JSON.parse(obj);
  if(time <= 11){
    event.sender.send('giveitems', obj[day].breakfast);
  }
  else if(time >= 11 && time <= 16){
    event.sender.send('giveitems', obj[day].lunch);
  }
  else{
    event.sender.send('giveitems', obj[day].dinner);
  }
});

ipcMain.on('update', (event,total) => {
  //db.run(".mode csv; .output messbill.csv; .quit");
  db.serialize(function(){
    db.all("SELECT cost FROM bill WHERE EXISTS (SELECT roll FROM bill WHERE roll = "+rollno+" ) AND roll = "+rollno , function(err,row){
    if(err){ console.log(err); }
    if(row !== undefined){
      var totalCost = row[0].cost;
      if(totalCost !== total){
        totalCost = totalCost + total;
        db.run("UPDATE bill SET cost = ? WHERE roll = ?",[totalCost, rollno]);
      }
    }
  });

  db.run("INSERT INTO bill(roll, cost) SELECT ?, ? WHERE NOT EXISTS(SELECT 1 FROM bill WHERE roll = ?)",[rollno,total,rollno]);
  });
  event.sender.send('updated');
  //delete rollno;
  BrowserWindow.getFocusedWindow().loadURL(`file://${__dirname}/Templates/additem.html`);
});

function generateCsvAndReset(){
  var r = "";
  db.serialize(function(){
    db.all("SELECT * FROM bill", function(err,rows){
      for(var i = 0; i<rows.length; i++){
        r = r+"\n"+rows[i].roll+","+rows[i].cost;
      }
      db.run("DELETE FROM bill");
    });
    fs.writeFileSync(`${__dirname}/Data/bill.csv`,r,'utf-8');
    fs.writeFile('/home/sanket/Desktop/messbill.csv',r,'utf-8',(err) => {
      if(err) console.log(err);
    });
  });
  console.log('done');
}

ipcMain.on('addtolist', (event,args) => {
  var day = new Date().getDay();
  var time = new Date().getHours();
  var obj = fs.readFileSync('./Data/items.json','utf-8');
  obj = JSON.parse(obj);
  if(time <= 11){
    obj[day].breakfast.push(args);
  }
  else if(time >= 11 && time <= 16){
    obj[day].lunch.push(args);
  }
  else{
    obj[day].dinner.push(args);
  }
  obj = JSON.stringify(obj);
  fs.writeFileSync('./Data/items.json',obj,'utf-8');
  event.sender.send('done');
});

ipcMain.on('deleteItem', (event,args) => {
  var day = new Date().getDay();
  var time = new Date().getHours();
  var obj = fs.readFileSync('./Data/items.json','utf-8');
  obj = JSON.parse(obj);
  if(time <= 11){
    obj[day].breakfast.splice(args,1);
  }
  else if(time >= 11 && time <= 16){
    obj[day].lunch.splice(args,1);
  }
  else{
    obj[day].dinner.splice(args,1);
  }
  obj = JSON.stringify(obj);
  fs.writeFileSync('./Data/items.json',obj,'utf-8');
  event.sender.send('done');
});
