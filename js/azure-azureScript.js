/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/jwt-decode/build/jwt-decode.esm.js":
/*!*********************************************************!*\
  !*** ./node_modules/jwt-decode/build/jwt-decode.esm.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   InvalidTokenError: () => (/* binding */ n),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
function e(e){this.message=e}e.prototype=new Error,e.prototype.name="InvalidCharacterError";var r="undefined"!=typeof window&&window.atob&&window.atob.bind(window)||function(r){var t=String(r).replace(/=+$/,"");if(t.length%4==1)throw new e("'atob' failed: The string to be decoded is not correctly encoded.");for(var n,o,a=0,i=0,c="";o=t.charAt(i++);~o&&(n=a%4?64*n+o:o,a++%4)?c+=String.fromCharCode(255&n>>(-2*a&6)):0)o="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(o);return c};function t(e){var t=e.replace(/-/g,"+").replace(/_/g,"/");switch(t.length%4){case 0:break;case 2:t+="==";break;case 3:t+="=";break;default:throw"Illegal base64url string!"}try{return function(e){return decodeURIComponent(r(e).replace(/(.)/g,(function(e,r){var t=r.charCodeAt(0).toString(16).toUpperCase();return t.length<2&&(t="0"+t),"%"+t})))}(t)}catch(e){return r(t)}}function n(e){this.message=e}function o(e,r){if("string"!=typeof e)throw new n("Invalid token specified");var o=!0===(r=r||{}).header?0:1;try{return JSON.parse(t(e.split(".")[o]))}catch(e){throw new n("Invalid token specified: "+e.message)}}n.prototype=new Error,n.prototype.name="InvalidTokenError";/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (o);
//# sourceMappingURL=jwt-decode.esm.js.map


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!****************************!*\
  !*** ./src/azureScript.js ***!
  \****************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var jwt_decode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jwt-decode */ "./node_modules/jwt-decode/build/jwt-decode.esm.js");


//Get URL and URL hash
var URLhash = window.location.hash;
var homeURL;

//When page loads
document.addEventListener('DOMContentLoaded', () => {
  if ((!URLhash || URLhash.length < 100) && !sessionStorage.getItem('MyToken') || sessionStorage.getItem('MyToken') && (0,jwt_decode__WEBPACK_IMPORTED_MODULE_0__["default"])(sessionStorage.getItem('MyToken')).exp < Date.now() / 1000) {
    sessionStorage.clear();
    history.pushState("", document.title, window.location.pathname + window.location.search);
    homeURL = window.location.href;
    oauth2Signin();
  } else if (!sessionStorage.getItem('MyToken')) {
    URLhash = URLhash.replace('#access_token=', '').split('&')[0];
    sessionStorage.setItem('MyToken', URLhash);
    history.pushState("", document.title, window.location.pathname + window.location.search);
    sendSubRequest();
  } else if (URLhash) {
    switch (URLhash.split('$')[0]) {
      case '#VM-home':
        sendVMRequest();
        break;
      case '#VM-start':
        console.log(URLhash.split('$')[2]);
        changeVMStatusRequest(URLhash.split('$')[1], URLhash.split('$')[2], false);
        break;
      case '#VM-stop':
        console.log(URLhash.split('$')[2]);
        changeVMStatusRequest(URLhash.split('$')[1], URLhash.split('$')[2], true);
        break;
      case '#VM-restart':
        console.log(URLhash.split('$')[2]);
        restartVMRequest(URLhash.split('$')[1], URLhash.split('$')[2]);
        break;
      case '#app-services-home':
        sendAppServicesRequest();
        break;
      case '#app-start':
        console.log(URLhash.split('$')[2]);
        changeAppStatusRequest(URLhash.split('$')[1], URLhash.split('$')[2], false);
        break;
      case '#app-stop':
        console.log(URLhash.split('$')[2]);
        changeAppStatusRequest(URLhash.split('$')[1], URLhash.split('$')[2], true);
        break;
      case '#app-restart':
        console.log(URLhash.split('$')[2]);
        restartAppRequest(URLhash.split('$')[1], URLhash.split('$')[2]);
        break;
      case '#resource-groups-home':
        sendResourceGroupRequest();
        break;
      default:
        break;
    }
  } else {
    sendSubRequest();
  }
});
function oauth2Signin() {
  //Oauth2 endpoint
  var endpoint = 'https://login.microsoftonline.com/common/oauth2/authorize';

  //This is the form we need in order to submit for authorization
  var form = document.createElement('form');
  form.setAttribute('method', 'GET');
  form.setAttribute('action', endpoint);

  //Parameters for the form
  var params = {
    'client_id': '457a5491-f470-4c0c-beae-efa300de112b',
    'redirect_uri': homeURL,
    'response_type': 'token',
    'resource': 'https://management.core.windows.net'
  };

  //Inputing the parameters into the form
  for (var p in params) {
    var input = document.createElement('input');
    input.setAttribute('type', 'hidden');
    input.setAttribute('name', p);
    input.setAttribute('value', params[p]);
    form.appendChild(input);
  }

  //Submit form
  document.body.appendChild(form);
  form.submit();

  //After this, we're redirected back to the Nextcloud app with the token in the URL hash
}

let sendSubRequest = ev => {
  //Getting parameters needed to make the API call
  let subscriptionURL = 'https://management.azure.com/subscriptions?api-version=2022-12-01';
  let token = sessionStorage.getItem('MyToken');
  let header = new Headers({
    'Authorization': "Bearer ".concat(token)
  });
  //header.append('Authorization', `Bearer ${token}`);
  console.log(header);

  //Creating the request
  let request = new Request(subscriptionURL, {
    method: 'GET',
    mode: 'cors',
    headers: header
  });
  console.log(request);

  //Create function that actually sends the request
  async function fetchSubscriptionID() {
    let subID;
    fetch(request).then(response => response.json()).then(data => {
      console.log(data);
      subID = data;
      sessionStorage.setItem('subID', data.value[0].id);
    }).catch(error => {
      console.error(error.message);
    });
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(subID);
      }, 2000);
    });
  }

  //Adds subscription info to HTML
  async function addSubtoHTML() {
    const subInfo = await fetchSubscriptionID();

    //Create title and add to page
    const pageTitle = document.createElement('h1');
    pageTitle.setAttribute('class', 'content-title');
    const titleText = document.createTextNode("Subscriptions");
    pageTitle.appendChild(titleText);
    const titleElement = document.getElementById('title-wrapper');
    titleElement.appendChild(pageTitle);

    //Add each subscription name to page
    if (subInfo.value.length > 0) {
      for (let i = 0; i < subInfo.value.length; i++) {
        const newEntry = document.createElement('tr');
        newEntry.setAttribute('class', 'content-entry');
        const entryText = document.createTextNode(subInfo.value[i].displayName);
        newEntry.appendChild(entryText);
        const tableElement = document.getElementById('content-list');
        tableElement.appendChild(newEntry);
      }
    } else {
      const newEntry = document.createElement('tr');
      newEntry.setAttribute('class', 'content-entry');
      const entryText = document.createTextNode("No Subscriptions");
      newEntry.appendChild(entryText);
      const tableElement = document.getElementById('content-list');
      tableElement.appendChild(newEntry);
    }
  }
  addSubtoHTML();
};
if (!sessionStorage.getItem('subID')) {
  setTimeout(createButtons, 2000);
} else {
  createButtons();
}
function createButtons() {
  var subscriptionsButton;
  var VMButton;
  var appServicesButton;
  var resourceGroupButton;
  var baseDiv;
  if (sessionStorage.getItem('subID')) {
    var navElement = document.getElementById('app-navigation-vue');

    //Create subscriptions button
    //The process for creating buttons is basically the same across all of them
    subscriptionsButton = document.createElement('a');
    subscriptionsButton.setAttribute('class', 'app-navigation-entry-link');
    baseDiv = document.createElement('div');
    baseDiv.setAttribute('class', 'app-navigation-entry');

    //Add subscription button to a div for all the buttons
    var entryText = document.createTextNode('Subscriptions');
    subscriptionsButton.appendChild(entryText);
    baseDiv.appendChild(subscriptionsButton);

    //Create Resource Groups Button
    resourceGroupButton = document.createElement('a');
    resourceGroupButton.setAttribute('class', 'app-navigation-entry-link');

    //Add Resource Groups button to the div
    entryText = document.createTextNode('Resource Groups');
    resourceGroupButton.appendChild(entryText);
    baseDiv.appendChild(resourceGroupButton);

    //Create VM button
    VMButton = document.createElement('a');
    VMButton.setAttribute('class', 'app-navigation-entry-link');

    //Add VM button to the div
    entryText = document.createTextNode('Virtual Machines');
    VMButton.appendChild(entryText);
    baseDiv.appendChild(VMButton);

    //Create App Services Button
    appServicesButton = document.createElement('a');
    appServicesButton.setAttribute('class', 'app-navigation-entry-link');

    //Add App Services button to the div
    entryText = document.createTextNode('App Services');
    appServicesButton.appendChild(entryText);
    baseDiv.appendChild(appServicesButton);

    //Add div to page
    navElement.appendChild(baseDiv);

    //Events for when the user clicks the appropriate button
    //Adds the hash to the URL to let the site know what page to load
    //and then reloads the page

    subscriptionsButton.addEventListener('click', () => {
      window.location.hash = '';
      location.reload();
    });
    VMButton.addEventListener('click', () => {
      window.location.hash = '#VM-home';
      location.reload();
    });
    appServicesButton.addEventListener('click', () => {
      window.location.hash = '#app-services-home';
      location.reload();
    });
    resourceGroupButton.addEventListener('click', () => {
      window.location.hash = '#resource-groups-home';
      location.reload();
    });
  }
}
let statusButtonClicked = false;
let sendVMRequest = ev => {
  const subscriptionID = sessionStorage.getItem('subID');
  let VMInfo;
  let vmURL = 'https://management.azure.com'.concat(subscriptionID, '/providers/Microsoft.Compute/virtualMachines?api-version=2023-07-01&statusOnly=true');
  let token = sessionStorage.getItem('MyToken');
  let header = new Headers();
  header.append('Authorization', "Bearer ".concat(token));
  let vmRequest = new Request(vmURL, {
    method: 'GET',
    mode: 'cors',
    headers: header
  });

  //Create function that actually sends the request
  async function fetchVM() {
    fetch(vmRequest).then(response => response.json()).then(data => {
      console.log(data);
      VMInfo = data;
    }).catch(error => {
      console.log("Error message:");
      console.error(error.message);
    });
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(VMInfo);
      }, 2000);
    });
  }
  async function addVMToHTML() {
    const VMInfo = await fetchVM();

    //Create title and add to page
    const pageTitle = document.createElement('h1');
    pageTitle.setAttribute('class', 'content-title');
    const titleText = document.createTextNode("Virtual Machines");
    pageTitle.appendChild(titleText);
    const titleElement = document.getElementById('title-wrapper');
    titleElement.appendChild(pageTitle);

    //Create header and add to page
    const newEntry = document.createElement('tr');
    newEntry.setAttribute('class', 'content-entry');

    //Create element for name header
    const nameElement = document.createElement('div');
    nameElement.setAttribute('class', 'content-name');
    const nameText = document.createTextNode('Name');
    nameElement.appendChild(nameText);
    newEntry.appendChild(nameElement);

    //Create element for status header
    const stateElement = document.createElement('div');
    stateElement.setAttribute('class', 'content-state');
    const stateText = document.createTextNode('Status');
    stateElement.appendChild(stateText);
    newEntry.appendChild(stateElement);
    const tableElement = document.getElementById('content-list');
    tableElement.appendChild(newEntry);

    //Add each VM info to page
    if (VMInfo.value.length > 0) {
      for (let i = 0; i < VMInfo.value.length; i++) {
        //Create table entry
        const newEntry = document.createElement('tr');
        newEntry.setAttribute('class', 'content-entry');

        //Create element for VM name
        const nameElement = document.createElement('div');
        nameElement.setAttribute('class', 'content-name');
        const nameText = document.createTextNode(VMInfo.value[i].name);
        nameElement.appendChild(nameText);
        newEntry.appendChild(nameElement);

        //Create element for VM status
        const stateElement = document.createElement('div');
        stateElement.setAttribute('class', 'content-state');
        let stateText = document.createTextNode(VMInfo.value[i].properties.instanceView.statuses[1].displayStatus);
        if (VMInfo.value[i].properties.instanceView.statuses[1].displayStatus == 'VM deallocated' && VMInfo.value[i].properties.instanceView.statuses[0].displayStatus == 'Updating') {
          stateText = document.createTextNode('VM starting');
        }
        stateElement.appendChild(stateText);
        newEntry.appendChild(stateElement);

        //Create start/stop button
        const buttonElement = document.createElement('button');
        buttonElement.setAttribute('class', 'content-button');
        var buttonText;
        if (stateElement.innerHTML == 'VM running' || stateElement.innerHTML == 'VM starting') {
          buttonText = document.createTextNode('Stop VM');
          buttonElement.addEventListener('click', () => {
            window.location.hash = '#VM-stop$'.concat(VMInfo.value[i].name, '$', VMInfo.value[i].id.split('/')[4]);
            location.reload();
          });
        } else {
          buttonText = document.createTextNode('Start VM');
          buttonElement.addEventListener('click', () => {
            window.location.hash = '#VM-start$'.concat(VMInfo.value[i].name, '$', VMInfo.value[i].id.split('/')[4]);
            location.reload();
          });
        }
        buttonElement.appendChild(buttonText);
        newEntry.appendChild(buttonElement);

        //Create restart button

        if (stateElement.innerHTML == 'VM running') {
          const restartElement = document.createElement('button');
          restartElement.setAttribute('class', 'content-button');
          const restartText = document.createTextNode('Restart VM');
          restartElement.appendChild(restartText);
          restartElement.addEventListener('click', () => {
            window.location.hash = '#VM-restart$'.concat(VMInfo.value[i].name, '$', VMInfo.value[i].id.split('/')[4]);
            location.reload();
          });
          newEntry.appendChild(restartElement);
        }
        const tableElement = document.getElementById('content-list');
        tableElement.appendChild(newEntry);
      }
    } else {
      const nameElement = document.createElement('div');
      nameElement.setAttribute('class', 'content-name');
      const nameText = document.createTextNode("No VMs");
      nameElement.appendChild(nameText);
      newEntry.appendChild(nameElement);
    }
  }
  addVMToHTML();
};
function changeVMStatusRequest(vmName, resourceGroup, vmRunning) {
  const pageTitle = document.createElement('h1');
  pageTitle.style.justifySelf = "center";
  pageTitle.setAttribute('class', 'content-title');
  const titleText = document.createTextNode("Processing Request");
  pageTitle.appendChild(titleText);
  const titleElement = document.getElementById('title-wrapper');
  titleElement.style.justifySelf = "center";
  titleElement.style.alignSelf = "center";
  titleElement.style.paddingTop = "500px";
  titleElement.style.paddingLeft = "0px";
  titleElement.appendChild(pageTitle);
  const loaderMain = document.createElement('div');
  loaderMain.setAttribute('class', 'lds-ellipsis');
  const loaderChild1 = document.createElement('div');
  loaderMain.appendChild(loaderChild1);
  const loaderChild2 = document.createElement('div');
  loaderMain.appendChild(loaderChild2);
  const loaderChild3 = document.createElement('div');
  loaderMain.appendChild(loaderChild3);
  const loaderChild4 = document.createElement('div');
  loaderMain.appendChild(loaderChild4);
  titleElement.appendChild(loaderMain);
  console.log(vmRunning);
  const subscriptionID = sessionStorage.getItem('subID');
  let changeStatusURL;
  let token = sessionStorage.getItem('MyToken');
  let header = new Headers();
  header.append('Authorization', "Bearer ".concat(token));
  let changeStatusRequest;
  if (vmRunning) {
    changeStatusURL = 'https://management.azure.com'.concat(subscriptionID, '/resourceGroups/', resourceGroup, '/providers/Microsoft.Compute/virtualMachines/', vmName, '/deallocate?api-version=2023-07-01');
    changeStatusRequest = new Request(changeStatusURL, {
      method: 'POST',
      mode: 'cors',
      headers: header
    });
  } else {
    changeStatusURL = 'https://management.azure.com'.concat(subscriptionID, '/resourceGroups/', resourceGroup, '/providers/Microsoft.Compute/virtualMachines/', vmName, '/start?api-version=2023-07-01');
    changeStatusRequest = new Request(changeStatusURL, {
      method: 'POST',
      mode: 'cors',
      headers: header
    });
  }
  async function fetchChangeStatus() {
    let statusChanged;
    fetch(changeStatusRequest).then(data => {
      console.log(data);
      statusChanged = true;
    }).catch(error => {
      console.log("Error message:");
      console.error(error.message);
    });
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(statusChanged);
      }, 2000);
    });
  }
  async function goBack() {
    const changeStatus = await fetchChangeStatus();
    console.log(changeStatus);
    if (changeStatus) {
      window.location.hash = '#VM-home';
      location.reload();
    }
  }
  goBack();
}
function restartVMRequest(vmName, resourceGroup) {
  const pageTitle = document.createElement('h1');
  pageTitle.style.justifySelf = "center";
  pageTitle.setAttribute('class', 'content-title');
  const titleText = document.createTextNode("Processing Request");
  pageTitle.appendChild(titleText);
  const titleElement = document.getElementById('title-wrapper');
  titleElement.style.justifySelf = "center";
  titleElement.style.alignSelf = "center";
  titleElement.style.paddingTop = "500px";
  titleElement.style.paddingLeft = "0px";
  titleElement.appendChild(pageTitle);
  const loaderMain = document.createElement('div');
  loaderMain.setAttribute('class', 'lds-ellipsis');
  const loaderChild1 = document.createElement('div');
  loaderMain.appendChild(loaderChild1);
  const loaderChild2 = document.createElement('div');
  loaderMain.appendChild(loaderChild2);
  const loaderChild3 = document.createElement('div');
  loaderMain.appendChild(loaderChild3);
  const loaderChild4 = document.createElement('div');
  loaderMain.appendChild(loaderChild4);
  titleElement.appendChild(loaderMain);
  const subscriptionID = sessionStorage.getItem('subID');
  let restartURL = 'https://management.azure.com'.concat(subscriptionID, '/resourceGroups/', resourceGroup, '/providers/Microsoft.Compute/virtualMachines/', vmName, '/restart?api-version=2023-07-01');
  let token = sessionStorage.getItem('MyToken');
  let header = new Headers();
  header.append('Authorization', "Bearer ".concat(token));
  let restartRequest = new Request(restartURL, {
    method: 'POST',
    mode: 'cors',
    headers: header
  });
  async function fetchRestart() {
    let restart;
    fetch(restartRequest).then(data => {
      console.log(data);
      restart = true;
    }).catch(error => {
      console.log("Error message:");
      console.error(error.message);
    });
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(restart);
      }, 2000);
    });
  }
  async function goBack() {
    const restart = await fetchRestart();
    console.log(restart);
    if (restart) {
      window.location.hash = '#VM-home';
      location.reload();
    }
  }
  goBack();
}
let sendAppServicesRequest = ev => {
  const subscriptionID = sessionStorage.getItem('subID');
  let appServicesInfo;
  let appServicesURL = 'https://management.azure.com'.concat(subscriptionID, '/providers/Microsoft.Web/sites?api-version=2022-03-01');
  let token = sessionStorage.getItem('MyToken');
  let header = new Headers();
  header.append('Authorization', "Bearer ".concat(token));
  let appServicesRequest = new Request(appServicesURL, {
    method: 'GET',
    mode: 'cors',
    headers: header
  });

  //Create function that actually sends the request
  async function fetchAppServices() {
    fetch(appServicesRequest).then(response => response.json()).then(data => {
      console.log(data);
      appServicesInfo = data;
    }).catch(error => {
      console.log("Error message:");
      console.error(error.message);
    });
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(appServicesInfo);
      }, 2000);
    });
  }
  async function addAppServicesToHTML() {
    const appServiceInfo = await fetchAppServices();

    //Create title and add to page
    const pageTitle = document.createElement('h1');
    pageTitle.setAttribute('class', 'content-title');
    const titleText = document.createTextNode("App Services");
    pageTitle.appendChild(titleText);
    const titleElement = document.getElementById('title-wrapper');
    titleElement.appendChild(pageTitle);

    //Create header and add to page
    const newEntry = document.createElement('tr');
    newEntry.setAttribute('class', 'content-entry');

    //Create element for name header
    const nameElement = document.createElement('div');
    nameElement.setAttribute('class', 'content-name');
    const nameText = document.createTextNode('Name');
    nameElement.appendChild(nameText);
    newEntry.appendChild(nameElement);

    //Create element for status header
    const stateElement = document.createElement('div');
    stateElement.setAttribute('class', 'content-state');
    const stateText = document.createTextNode('Status');
    stateElement.appendChild(stateText);
    newEntry.appendChild(stateElement);
    const tableElement = document.getElementById('content-list');
    tableElement.appendChild(newEntry);

    //Add each App Service info to page
    if (appServiceInfo.value.length > 0) {
      for (let i = 0; i < appServiceInfo.value.length; i++) {
        //Create table entry
        const newEntry = document.createElement('tr');
        newEntry.setAttribute('class', 'content-entry');

        //Create element for app name
        const nameElement = document.createElement('div');
        nameElement.setAttribute('class', 'content-name');
        const entryText = document.createTextNode(appServiceInfo.value[i].name);
        nameElement.appendChild(entryText);
        newEntry.appendChild(nameElement);

        //Create element for app status
        const stateElement = document.createElement('div');
        stateElement.setAttribute('class', 'content-state');
        const stateText = document.createTextNode(appServiceInfo.value[i].properties.state);
        stateElement.appendChild(stateText);
        newEntry.appendChild(stateElement);

        //Create start/stop button
        const buttonElement = document.createElement('button');
        buttonElement.setAttribute('class', 'content-button');
        var buttonText;
        if (appServiceInfo.value[i].properties.state == 'Running') {
          buttonText = document.createTextNode('Stop App');
          buttonElement.addEventListener('click', () => {
            window.location.hash = '#app-stop$'.concat(appServiceInfo.value[i].name, '$', appServiceInfo.value[i].id.split('/')[4]);
            location.reload();
          });
        } else {
          buttonText = document.createTextNode('Start App');
          buttonElement.addEventListener('click', () => {
            window.location.hash = '#app-start$'.concat(appServiceInfo.value[i].name, '$', appServiceInfo.value[i].id.split('/')[4]);
            location.reload();
          });
        }
        buttonElement.appendChild(buttonText);
        newEntry.appendChild(buttonElement);

        //Create restart button

        if (stateElement.innerHTML == 'Running') {
          const restartElement = document.createElement('button');
          restartElement.setAttribute('class', 'content-button');
          const restartText = document.createTextNode('Restart App');
          restartElement.appendChild(restartText);
          restartElement.addEventListener('click', () => {
            window.location.hash = '#app-restart$'.concat(appServiceInfo.value[i].name, '$', appServiceInfo.value[i].id.split('/')[4]);
            location.reload();
          });
          newEntry.appendChild(restartElement);
        }
        const tableElement = document.getElementById('content-list');
        tableElement.appendChild(newEntry);
      }
    } else {
      const nameElement = document.createElement('div');
      nameElement.setAttribute('class', 'content-name');
      const entryText = document.createTextNode("No Apps");
      nameElement.appendChild(entryText);
      newEntry.appendChild(nameElement);
    }
  }
  addAppServicesToHTML();
};
function changeAppStatusRequest(appName, resourceGroup, appRunning) {
  const pageTitle = document.createElement('h1');
  pageTitle.style.justifySelf = "center";
  pageTitle.setAttribute('class', 'content-title');
  const titleText = document.createTextNode("Processing Request");
  pageTitle.appendChild(titleText);
  const titleElement = document.getElementById('title-wrapper');
  titleElement.style.justifySelf = "center";
  titleElement.style.alignSelf = "center";
  titleElement.style.paddingTop = "500px";
  titleElement.style.paddingLeft = "0px";
  titleElement.appendChild(pageTitle);
  const loaderMain = document.createElement('div');
  loaderMain.setAttribute('class', 'lds-ellipsis');
  const loaderChild1 = document.createElement('div');
  loaderMain.appendChild(loaderChild1);
  const loaderChild2 = document.createElement('div');
  loaderMain.appendChild(loaderChild2);
  const loaderChild3 = document.createElement('div');
  loaderMain.appendChild(loaderChild3);
  const loaderChild4 = document.createElement('div');
  loaderMain.appendChild(loaderChild4);
  titleElement.appendChild(loaderMain);
  console.log(appRunning);
  const subscriptionID = sessionStorage.getItem('subID');
  let changeStatusURL;
  let token = sessionStorage.getItem('MyToken');
  let header = new Headers();
  header.append('Authorization', "Bearer ".concat(token));
  let changeStatusRequest;
  if (appRunning) {
    changeStatusURL = 'https://management.azure.com'.concat(subscriptionID, '/resourceGroups/', resourceGroup, '/providers/Microsoft.Web/sites/', appName, '/stop?api-version=2022-03-01');
    changeStatusRequest = new Request(changeStatusURL, {
      method: 'POST',
      mode: 'cors',
      headers: header
    });
  } else {
    changeStatusURL = 'https://management.azure.com'.concat(subscriptionID, '/resourceGroups/', resourceGroup, '/providers/Microsoft.Web/sites/', appName, '/start?api-version=2022-03-01');
    changeStatusRequest = new Request(changeStatusURL, {
      method: 'POST',
      mode: 'cors',
      headers: header
    });
  }
  async function fetchChangeStatus() {
    let statusChanged;
    fetch(changeStatusRequest).then(data => {
      console.log(data);
      statusChanged = true;
    }).catch(error => {
      console.log("Error message:");
      console.error(error.message);
    });
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(statusChanged);
      }, 5000);
    });
  }
  async function goBack() {
    const changeStatus = await fetchChangeStatus();
    console.log(changeStatus);
    if (changeStatus) {
      window.location.hash = '#app-services-home';
      location.reload();
    }
  }
  goBack();
}
function restartAppRequest(appName, resourceGroup) {
  const pageTitle = document.createElement('h1');
  pageTitle.style.justifySelf = "center";
  pageTitle.setAttribute('class', 'content-title');
  const titleText = document.createTextNode("Processing Request");
  pageTitle.appendChild(titleText);
  const titleElement = document.getElementById('title-wrapper');
  titleElement.style.justifySelf = "center";
  titleElement.style.alignSelf = "center";
  titleElement.style.paddingTop = "500px";
  titleElement.style.paddingLeft = "0px";
  titleElement.appendChild(pageTitle);
  const loaderMain = document.createElement('div');
  loaderMain.setAttribute('class', 'lds-ellipsis');
  const loaderChild1 = document.createElement('div');
  loaderMain.appendChild(loaderChild1);
  const loaderChild2 = document.createElement('div');
  loaderMain.appendChild(loaderChild2);
  const loaderChild3 = document.createElement('div');
  loaderMain.appendChild(loaderChild3);
  const loaderChild4 = document.createElement('div');
  loaderMain.appendChild(loaderChild4);
  titleElement.appendChild(loaderMain);
  const subscriptionID = sessionStorage.getItem('subID');
  let restartURL = 'https://management.azure.com'.concat(subscriptionID, '/resourceGroups/', resourceGroup, '/providers/Microsoft.Web/sites/', appName, '/restart?api-version=2022-03-01');
  let token = sessionStorage.getItem('MyToken');
  let header = new Headers();
  header.append('Authorization', "Bearer ".concat(token));
  let restartRequest = new Request(restartURL, {
    method: 'POST',
    mode: 'cors',
    headers: header
  });
  async function fetchRestart() {
    let restart;
    fetch(restartRequest).then(data => {
      console.log(data);
      restart = true;
    }).catch(error => {
      console.log("Error message:");
      console.error(error.message);
    });
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(restart);
      }, 2000);
    });
  }
  async function goBack() {
    const restart = await fetchRestart();
    console.log(restart);
    if (restart) {
      window.location.hash = '#app-services-home';
      location.reload();
    }
  }
  goBack();
}
let sendResourceGroupRequest = ev => {
  const subscriptionID = sessionStorage.getItem('subID');
  let ResourceGroupInfo;
  let ResourceGroupURL = 'https://management.azure.com'.concat(subscriptionID, '/resourcegroups?api-version=2021-04-01');
  let token = sessionStorage.getItem('MyToken');
  let header = new Headers();
  header.append('Authorization', "Bearer ".concat(token));
  let ResourceGroupRequest = new Request(ResourceGroupURL, {
    method: 'GET',
    mode: 'cors',
    headers: header
  });

  //Create function that actually sends the request
  async function fetchResourceGroup() {
    fetch(ResourceGroupRequest).then(response => response.json()).then(data => {
      console.log(data);
      ResourceGroupInfo = data;
    }).catch(error => {
      console.log("Error message:");
      console.error(error.message);
    });
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(ResourceGroupInfo);
      }, 2000);
    });
  }
  async function addResourceGroupToHTML() {
    const resourceGroupInfo = await fetchResourceGroup();

    //Create title and add to page
    const pageTitle = document.createElement('h1');
    pageTitle.setAttribute('class', 'content-title');
    const titleText = document.createTextNode("Resource Groups");
    pageTitle.appendChild(titleText);
    const titleElement = document.getElementById('title-wrapper');
    titleElement.appendChild(pageTitle);

    //Create header and add to page
    const newEntry = document.createElement('tr');
    newEntry.setAttribute('class', 'content-entry');

    //Create element for name header
    const nameElement = document.createElement('div');
    nameElement.setAttribute('class', 'content-name');
    const nameText = document.createTextNode('Name');
    nameElement.appendChild(nameText);
    newEntry.appendChild(nameElement);
    const tableElement = document.getElementById('content-list');
    tableElement.appendChild(newEntry);

    //Add each App Service info to page
    if (resourceGroupInfo.value.length > 0) {
      for (let i = 0; i < resourceGroupInfo.value.length; i++) {
        //Create table entry
        const newEntry = document.createElement('tr');
        newEntry.setAttribute('class', 'content-entry');

        //Create element for resource group name
        const nameElement = document.createElement('div');
        nameElement.setAttribute('class', 'content-name');
        const entryText = document.createTextNode(resourceGroupInfo.value[i].name);
        nameElement.appendChild(entryText);
        newEntry.appendChild(nameElement);
        const tableElement = document.getElementById('content-list');
        tableElement.appendChild(newEntry);
      }
    } else {
      const nameElement = document.createElement('div');
      nameElement.setAttribute('class', 'content-name');
      const entryText = document.createTextNode("No Resource Groups");
      nameElement.appendChild(entryText);
      newEntry.appendChild(nameElement);
    }
  }
  addResourceGroupToHTML();
};
})();

/******/ })()
;
//# sourceMappingURL=azure-azureScript.js.map