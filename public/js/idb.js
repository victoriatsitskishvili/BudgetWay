//including the prefixes of implementations we want to test//
const indexDB=
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB||window.shimIndexedDB;

let db;
// To open our database, the second param is a version of a database, Version 1 is the first version of the database// 

const request = indexedDB.open("budget", 1);

//onupgradeneeded is called when you change the db version//
request.onupgradeneeded = ({ target }) => {
    let db = target.result;
    db.createObjectStore("pending", { autoIncrement: true });
  };
  // onsuccess is called each time you make a new request //
  request.onsuccess = ({ target }) => {
    db = target.result;
  
    // is app online? //
    if (navigator.onLine) {
      checkDatabase();
    }
  };
  
  // handles the error event, fired when a request returns an error //
  request.onerror = function(event) {
    console.log("There has been an error with retrieving your data" + event.target.errorCode);
  };
  
  function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
  
    store.add(record);
  }
  
  function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();
  
    getAll.onsuccess = function() {
      if (getAll.result.length > 0) {
          // send to server // 
        fetch("/api/transaction/bulk", {
          method: "POST",
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: "application/json, text/plain, */*", "Content-Type":"application/json"
          }
        })
        .then(response => {        
          return response.json();
        })
        .then(() => {
          // if was successful - delete the records // 

          const transaction = db.transaction(["pending"], "readwrite");
          const store = transaction.objectStore("pending");
          store.clear();
        });
      }
    };
  }
  
  //db is back online // 
  window.addEventListener("online", checkDatabase);