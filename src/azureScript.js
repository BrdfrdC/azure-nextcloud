import jwt_decode from "jwt-decode";
import { concat } from "lodash";

//Get URL and URL hash
var URLhash = window.location.hash;
var homeURL;

//When page loads
document.addEventListener('DOMContentLoaded', () => {
    if(((!URLhash || URLhash.length < 100) && !sessionStorage.getItem('MyToken')) || (sessionStorage.getItem('MyToken') && (jwt_decode(sessionStorage.getItem('MyToken')).exp < Date.now() / 1000))) {
        sessionStorage.clear();
        history.pushState("", document.title, window.location.pathname + window.location.search);
        homeURL = window.location.href;
        oauth2Signin();
    } else if (!sessionStorage.getItem('MyToken')) {
        URLhash = URLhash.replace('#access_token=','').split('&')[0];
        sessionStorage.setItem('MyToken', URLhash);
        history.pushState("", document.title, window.location.pathname + window.location.search);
        sendSubRequest();
    } else if (URLhash) {
        switch(URLhash.split('$')[0]) {
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
            default:
                break;
        }
    } else {
        sendSubRequest();
    }
})

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
        'resource': 'https://management.core.windows.net',
    }

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

let sendSubRequest = (ev) => {

    //Getting parameters needed to make the API call
    let subscriptionURL = 'https://management.azure.com/subscriptions?api-version=2022-12-01';
    let token = sessionStorage.getItem('MyToken');
    let header = new Headers();
    header.append('Authorization', `Bearer ${token}`);

    //Creating the request
    let request = new Request(subscriptionURL, {
        method: 'GET',
        mode: 'cors',
        headers: header
    });

    //Create function that actually sends the request
    async function fetchSubscriptionID() {
        let subID;
        fetch(request)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                subID = data;
                sessionStorage.setItem('subID', data.value[0].id);
            })
            .catch(error => {
                console.error(error.message);
            });
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(subID);
                }, 2000);
        })
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
        for(let i = 0; i < subInfo.value.length; i++) {
            const newEntry = document.createElement('tr');
            newEntry.setAttribute('class', 'content-entry');
            const entryText = document.createTextNode(subInfo.value[i].displayName);
            newEntry.appendChild(entryText);

            const tableElement = document.getElementById('content-list');
            tableElement.appendChild(newEntry);
        }
    }

    addSubtoHTML();
}

if(!sessionStorage.getItem('subID')) {
    setTimeout(createButtons, 2000);
} else {
    createButtons();
}

function createButtons() {
    var subscriptionsButton;
    var VMButton;
    var appServicesButton;
    var baseDiv;


    if(sessionStorage.getItem('subID')) {
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
    }
}

let statusButtonClicked = false;

let sendVMRequest = (ev) => {
    const subscriptionID = sessionStorage.getItem('subID');
    let VMInfo;

    let vmURL = 'https://management.azure.com'.concat(subscriptionID, '/providers/Microsoft.Compute/virtualMachines?api-version=2023-07-01&statusOnly=true');
    let token = sessionStorage.getItem('MyToken');
    let header = new Headers();
    header.append('Authorization', `Bearer ${token}`);

    let vmRequest = new Request(vmURL, {
        method: 'GET',
        mode: 'cors',
        headers: header
    });

    //Create function that actually sends the request
    async function fetchVM() {
        fetch(vmRequest)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            VMInfo = data;
        })
        .catch(error => {
            console.log("Error message:")
            console.error(error.message);
        });

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(VMInfo);
                }, 2000);
        })
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
        for(let i = 0; i < VMInfo.value.length; i++) {

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
            const stateText = document.createTextNode(VMInfo.value[i].properties.instanceView.statuses[1].displayStatus);
            stateElement.appendChild(stateText);
            newEntry.appendChild(stateElement);

            //Create start/stop button
            const buttonElement = document.createElement('button');
            buttonElement.setAttribute('class', 'content-button');
            var buttonText;

            if(VMInfo.value[i].properties.instanceView.statuses[1].displayStatus == 'VM running') {
                buttonText = document.createTextNode('Stop VM');
                buttonElement.addEventListener('click',() => {
                    window.location.hash = '#VM-stop$'.concat(VMInfo.value[i].name, '$', VMInfo.value[i].id.split('/')[4]);
                    location.reload();
                })
            } else {
                buttonText = document.createTextNode('Start VM');
                buttonElement.addEventListener('click',() => {
                    window.location.hash = '#VM-start$'.concat(VMInfo.value[i].name, '$', VMInfo.value[i].id.split('/')[4]);
                    location.reload();
                })
            }

            buttonElement.appendChild(buttonText);
            newEntry.appendChild(buttonElement);

            const tableElement = document.getElementById('content-list');
            tableElement.appendChild(newEntry);
        }
    }
    
    addVMToHTML();
}

function changeVMStatusRequest(vmName, resourceGroup, vmRunning) {
    console.log(vmRunning);
    const subscriptionID = sessionStorage.getItem('subID');
    let changeStatusURL;
    let token = sessionStorage.getItem('MyToken');
    let header = new Headers();
    header.append('Authorization', `Bearer ${token}`);
    let changeStatusRequest

    if(vmRunning) {
        changeStatusURL = 'https://management.azure.com'.concat(subscriptionID, 
            '/resourceGroups/', resourceGroup, '/providers/Microsoft.Compute/virtualMachines/', vmName, 
            '/deallocate?api-version=2023-07-01');
        changeStatusRequest = new Request(changeStatusURL, {
            method: 'POST',
            mode: 'cors',
            headers: header
        });
    } else {
        changeStatusURL = 'https://management.azure.com'.concat(subscriptionID, 
            '/resourceGroups/', resourceGroup, '/providers/Microsoft.Compute/virtualMachines/', vmName, 
            '/start?api-version=2023-07-01');
        changeStatusRequest = new Request(changeStatusURL, {
            method: 'POST',
            mode: 'cors',
            headers: header
        });
    }

    async function fetchChangeStatus() {
        let statusChanged;
        fetch(changeStatusRequest)
        .then(data => {
            console.log(data)
            statusChanged = true;
        })
        .catch(error => {
            console.log("Error message:")
            console.error(error.message);
        });

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(statusChanged);
                }, 6000);
        })
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

let sendAppServicesRequest = (ev) => {
    const subscriptionID = sessionStorage.getItem('subID');
    let appServicesInfo;

    let appServicesURL = 'https://management.azure.com'.concat(subscriptionID, '/providers/Microsoft.Web/sites?api-version=2022-03-01');
    let token = sessionStorage.getItem('MyToken');
    let header = new Headers();
    header.append('Authorization', `Bearer ${token}`);

    let appServicesRequest = new Request(appServicesURL, {
        method: 'GET',
        mode: 'cors',
        headers: header
    });

    //Create function that actually sends the request
    async function fetchAppServices() {
        fetch(appServicesRequest)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            appServicesInfo = data;
        })
        .catch(error => {
            console.log("Error message:")
            console.error(error.message);
        });

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(appServicesInfo);
                }, 2000);
        })
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
        for(let i = 0; i < appServiceInfo.value.length; i++) {

            //Create table entry
            const newEntry = document.createElement('tr');
            newEntry.setAttribute('class', 'content-entry');

            //Create element for VM name
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

            if(appServiceInfo.value[i].properties.state == 'Running') {
                buttonText = document.createTextNode('Stop App');
                buttonElement.addEventListener('click',() => {
                    window.location.hash = '#app-stop$'.concat(appServiceInfo.value[i].name, '$', appServiceInfo.value[i].id.split('/')[4]);
                    location.reload();
                })
            } else {
                buttonText = document.createTextNode('Start App');
                buttonElement.addEventListener('click',() => {
                    window.location.hash = '#app-start$'.concat(appServiceInfo.value[i].name, '$', appServiceInfo.value[i].id.split('/')[4]);
                    location.reload();
                })
            }

            buttonElement.appendChild(buttonText);
            newEntry.appendChild(buttonElement);

            const tableElement = document.getElementById('content-list');
            tableElement.appendChild(newEntry);
        }
    }
    
    addAppServicesToHTML();
}

function changeAppStatusRequest(appName, resourceGroup, appRunning) {
    console.log(appRunning);
    const subscriptionID = sessionStorage.getItem('subID');
    let changeStatusURL;
    let token = sessionStorage.getItem('MyToken');
    let header = new Headers();
    header.append('Authorization', `Bearer ${token}`);
    let changeStatusRequest

    if(appRunning) {
        changeStatusURL = 'https://management.azure.com'.concat(subscriptionID, 
            '/resourceGroups/', resourceGroup, '/providers/Microsoft.Web/sites/', appName, 
            '/stop?api-version=2022-03-01');
        changeStatusRequest = new Request(changeStatusURL, {
            method: 'POST',
            mode: 'cors',
            headers: header
        });
    } else {
        changeStatusURL = 'https://management.azure.com'.concat(subscriptionID, 
            '/resourceGroups/', resourceGroup, '/providers/Microsoft.Web/sites/', appName, 
            '/start?api-version=2022-03-01');
        changeStatusRequest = new Request(changeStatusURL, {
            method: 'POST',
            mode: 'cors',
            headers: header
        });
    }

    async function fetchChangeStatus() {
        let statusChanged;
        fetch(changeStatusRequest)
        .then(data => {
            console.log(data)
            statusChanged = true;
        })
        .catch(error => {
            console.log("Error message:")
            console.error(error.message);
        });

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(statusChanged);
                }, 6000);
        })
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