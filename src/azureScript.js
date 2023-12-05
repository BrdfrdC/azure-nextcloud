import jwt_decode from "jwt-decode";

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
                changeVMStatusRequest(URLhash.split('$')[1], URLhash.split('$')[2], false);
                break;
            case '#VM-stop':
                changeVMStatusRequest(URLhash.split('$')[1], URLhash.split('$')[2], true);
                break;
            case '#VM-restart':
                restartVMRequest(URLhash.split('$')[1], URLhash.split('$')[2]);
                break;
            case '#app-services-home':
                sendAppServicesRequest();
                break;
            case '#app-start':
                changeAppStatusRequest(URLhash.split('$')[1], URLhash.split('$')[2], false);
                break;
            case '#app-stop':
                changeAppStatusRequest(URLhash.split('$')[1], URLhash.split('$')[2], true);
                break;
            case '#app-restart':
                restartAppRequest(URLhash.split('$')[1], URLhash.split('$')[2]);
                break;
            case '#resource-groups-home':
                sendResourceGroupRequest();
                break;
            case '#resource-groups-create':
                createResourceGroup(URLhash.split('$')[1], URLhash.split('$')[2]);
                break;
            case '#DB-servers':
                sendServerRequest();
                break;
            case '#DB-home':
                sendDBRequest(URLhash.split('$')[1], URLhash.split('$')[2]); 
                break;
            case '#DB-stop':
                changeDBStatusRequest(URLhash.split('$')[1], URLhash.split('$')[2], URLhash.split('$')[3], true); //change function input to include server. how to do that?
                break;
            case 'DB-start':
                changeDBStatusRequest(URLhash.split('$')[1], URLhash.split('$')[2], URLhash.split('$')[3], false); //change function input to include server. how to do that?
                break;
                //AS
            case '#SA-home':
                sendStorageAccountRequest();
                break;
            case '#SA-delete':
                deleteStorageAccountRequest(URLhash.split('$')[1], URLhash.split('$')[2]);
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
    let header = new Headers({'Authorization': `Bearer ${token}`});
    //header.append('Authorization', `Bearer ${token}`);

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
        if(subInfo.value.length > 0) {
            for(let i = 0; i < subInfo.value.length; i++) {
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
    var resourceGroupButton;
    var storageAccountButton;
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

        // Inside createButtons function

        var ServerButton

        //Create Server button
        ServerButton = document.createElement('a');
        ServerButton.setAttribute('class', 'app-navigation-entry-link');
    
        //Add Server button to the div
        entryText = document.createTextNode('Servers');
        ServerButton.appendChild(entryText);
        baseDiv.appendChild(ServerButton);

        ServerButton.addEventListener('click', () => {
            window.location.hash = '#DB-servers';
            location.reload();
        });

        //Create Storage Account Button
        storageAccountButton = document.createElement('a');
        storageAccountButton.setAttribute('class', 'app-navigation-entry-link');

        //Add Storage Account button to the div
        entryText = document.createTextNode('Storage Accounts');
        storageAccountButton.appendChild(entryText);
        baseDiv.appendChild(storageAccountButton);

        storageAccountButton.addEventListener('click', () => {
            window.location.hash = '#SA-home';
            location.reload();
        });

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
            VMInfo = data;
        })
        .catch(error => {
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
        if(VMInfo.value.length > 0) {
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
                let stateText = document.createTextNode(VMInfo.value[i].properties.instanceView.statuses[1].displayStatus);

                if(VMInfo.value[i].properties.instanceView.statuses[1].displayStatus == 'VM deallocated' && VMInfo.value[i].properties.instanceView.statuses[0].displayStatus == 'Updating') {
                    stateText = document.createTextNode('VM starting');
                }

                stateElement.appendChild(stateText);
                newEntry.appendChild(stateElement);

                //Create start/stop button
                const buttonElement = document.createElement('button');
                buttonElement.setAttribute('class', 'content-button');
                var buttonText;

                if(stateElement.innerHTML == 'VM running' || stateElement.innerHTML == 'VM starting') {
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

                //Create restart button

                if(stateElement.innerHTML == 'VM running') {
                    const restartElement = document.createElement('button');
                    restartElement.setAttribute('class', 'content-button');
                    const restartText = document.createTextNode('Restart VM');
                    restartElement.appendChild(restartText);
    
                    restartElement.addEventListener('click',() => {
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
}

function changeVMStatusRequest(vmName, resourceGroup, vmRunning) {
    
    const pageTitle = document.createElement('h1');
    pageTitle.style.justifySelf = "center";
    pageTitle.setAttribute('class', 'content-title');
    const titleText = document.createTextNode("Processing Request");
    pageTitle.appendChild(titleText);

    const titleElement = document.getElementById('title-wrapper');
    titleElement.style.justifySelf = "center";
    titleElement.style.alignSelf = "center";
    titleElement.style.paddingTop = "200px";
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
            statusChanged = true;
        })
        .catch(error => {
            console.error(error.message);
        });

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(statusChanged);
                }, 2000);
        })
    }

    async function goBack() {
        const changeStatus = await fetchChangeStatus();

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
    titleElement.style.paddingTop = "200px";
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

    let restartURL = 'https://management.azure.com'.concat(subscriptionID, 
    '/resourceGroups/', resourceGroup, '/providers/Microsoft.Compute/virtualMachines/', vmName, 
    '/restart?api-version=2023-07-01');
    let token = sessionStorage.getItem('MyToken');
    let header = new Headers();
    header.append('Authorization', `Bearer ${token}`);

    let restartRequest = new Request(restartURL, {
        method: 'POST',
        mode: 'cors',
        headers: header
    });

    async function fetchRestart() {
        let restart;
        fetch(restartRequest)
        .then(data => {
            restart = true;
        })
        .catch(error => {
            console.error(error.message);
        });

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(restart);
                }, 2000);
        })
    }

    async function goBack() {
        const restart = await fetchRestart();
        if (restart) {
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
            appServicesInfo = data;
        })
        .catch(error => {
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
        if(appServiceInfo.value.length > 0) {
            for(let i = 0; i < appServiceInfo.value.length; i++) {

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

                //Create restart button

                if(stateElement.innerHTML == 'Running') {
                    const restartElement = document.createElement('button');
                    restartElement.setAttribute('class', 'content-button');
                    const restartText = document.createTextNode('Restart App');
                    restartElement.appendChild(restartText);
    
                    restartElement.addEventListener('click',() => {
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
}

function changeAppStatusRequest(appName, resourceGroup, appRunning) {
    const pageTitle = document.createElement('h1');
    pageTitle.style.justifySelf = "center";
    pageTitle.setAttribute('class', 'content-title');
    const titleText = document.createTextNode("Processing Request");
    pageTitle.appendChild(titleText);

    const titleElement = document.getElementById('title-wrapper');
    titleElement.style.justifySelf = "center";
    titleElement.style.alignSelf = "center";
    titleElement.style.paddingTop = "200px";
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
            statusChanged = true;
        })
        .catch(error => {
            console.error(error.message);
        });

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(statusChanged);
                }, 5000);
        })
    }

    async function goBack() {
        const changeStatus = await fetchChangeStatus();
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
    titleElement.style.paddingTop = "200px";
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

    let restartURL = 'https://management.azure.com'.concat(subscriptionID, 
    '/resourceGroups/', resourceGroup, '/providers/Microsoft.Web/sites/', appName, 
    '/restart?api-version=2022-03-01');
    let token = sessionStorage.getItem('MyToken');
    let header = new Headers();
    header.append('Authorization', `Bearer ${token}`);

    let restartRequest = new Request(restartURL, {
        method: 'POST',
        mode: 'cors',
        headers: header
    });

    async function fetchRestart() {
        let restart;
        fetch(restartRequest)
        .then(data => {
            restart = true;
        })
        .catch(error => {
            console.error(error.message);
        });

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(restart);
                }, 2000);
        })
    }

    async function goBack() {
        const restart = await fetchRestart();
        if (restart) {
            window.location.hash = '#app-services-home';
            location.reload();
        }
    }

    goBack();
}

let sendResourceGroupRequest = (ev) => {
    const subscriptionID = sessionStorage.getItem('subID');
    let ResourceGroupInfo;

    let ResourceGroupURL = 'https://management.azure.com'.concat(subscriptionID, '/resourcegroups?api-version=2021-04-01');
    let token = sessionStorage.getItem('MyToken');
    let header = new Headers();
    header.append('Authorization', `Bearer ${token}`);

    let ResourceGroupRequest = new Request(ResourceGroupURL, {
        method: 'GET',
        mode: 'cors',
        headers: header
    });

    //Create function that actually sends the request
    async function fetchResourceGroup() {
        fetch(ResourceGroupRequest)
        .then(response => response.json())
        .then(data => {
            ResourceGroupInfo = data;
        })
        .catch(error => {
            console.error(error.message);
        });

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(ResourceGroupInfo);
                }, 2000);
        })
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

        //Add each Resource Group info to page
        if(resourceGroupInfo.value.length > 0) {
            for(let i = 0; i < resourceGroupInfo.value.length; i++) {

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

            const tableElement = document.getElementById('content-list');
            tableElement.appendChild(newEntry);
        }

        //Create "Create New Resource Group" button
        const buttonElement = document.createElement('button');
        buttonElement.setAttribute('class', 'create-button');
        buttonElement.style.marginBottom = "30px";
        var buttonText = document.createTextNode('Create New Resource Group');

        //Create "Create New Resource Group" form
        const formContainer = document.createElement('div');
        formContainer.setAttribute('class','form-container');
        formContainer.hidden = true;
        const formElement = document.createElement('form');
        formElement.setAttribute('class', 'form-element');
        formContainer.appendChild(formElement);

        const exitElement = document.createElement('button');
        exitElement.setAttribute('class', 'exit-button');
        var exitX = document.createTextNode('×');
        exitElement.appendChild(exitX);

        exitElement.addEventListener('click',() => {
            openResourceGroupForm(formContainer, false);
        })

        formElement.appendChild(exitElement);

        const formTitle = document.createElement('h1');
        formTitle.setAttribute('class', 'form-title');
        var formTitleText = document.createTextNode('Create New Resource Group');
        formTitle.appendChild(formTitleText);
        formElement.appendChild(formTitle);
        
        const nameLabel = document.createElement('label');
        nameLabel.setAttribute('for', 'name');
        nameLabel.setAttribute('class', 'resource-group-label');
        var labelText = document.createTextNode('Resource Group Name');
        nameLabel.appendChild(labelText);
        formElement.appendChild(nameLabel);

        const nameInput = document.createElement('input');
        nameInput.setAttribute('type', 'text');
        nameInput.setAttribute('class', 'form-input');
        nameInput.setAttribute('placeholder', 'Enter Resource Group Name');
        nameInput.setAttribute('name', 'RGname');
        nameInput.required = true;
        formElement.appendChild(nameInput);

        const selectLabel = document.createElement('label');
        selectLabel.setAttribute('for', 'location');
        selectLabel.setAttribute('class', 'resource-group-label');
        var labelLocationText = document.createTextNode('Resource Group Location');
        selectLabel.appendChild(labelLocationText);
        formElement.appendChild(selectLabel);

        const selectElement = document.createElement('select');
        selectElement.setAttribute('name','location');
        selectElement.setAttribute('class', 'form-input');
        const disabledOption = document.createElement('option');
        var disabledText = document.createTextNode('Please Select a Location');
        disabledOption.appendChild(disabledText);
        disabledOption.selected = true;
        disabledOption.disabled = true
        selectElement.appendChild(disabledOption);

        const locationOptions = ["eastus", "East US", "eastus2", "East US 2", "centralus", "Central US", 
            "northcentralus", "North Central US", "southcentralus", "South Central US", "westus", "West US", 
            "westus2", "West US 2", "westus3", "West US 3"];

        for(let i = 0; i < locationOptions.length; i++) {
            const newOption = document.createElement('option');
            newOption.value = locationOptions[i];
            var newText = document.createTextNode(locationOptions[i+1]);
            newOption.appendChild(newText);
            selectElement.appendChild(newOption);
            i++;
        }

        formElement.appendChild(selectElement);

        const submitElement = document.createElement('button');
        var submitText = document.createTextNode('Submit');
        submitElement.appendChild(submitText);

        buttonElement.addEventListener('click',() => {
            openResourceGroupForm(formContainer, true);
        })

        buttonElement.appendChild(buttonText);
        tableElement.appendChild(buttonElement);

        submitElement.addEventListener('click', reloadResourceGroupPage, false);
        formElement.appendChild(submitElement);

        tableElement.appendChild(formContainer);
    }

    function reloadResourceGroupPage(event) {
        event.preventDefault();
        var RGName = document.getElementsByName('RGname')[0].value;
        var RGlocation = document.getElementsByName('location')[0].value;
        window.location.hash = '#resource-groups-create$'.concat(RGName, '$', RGlocation);
        location.reload();
    }

    addResourceGroupToHTML();
}

function openResourceGroupForm(form, open) {
    if(open) {
        form.hidden = false;
    } else {
        form.hidden = true;
    }
}

function createResourceGroup(RGName, RGlocation) {
    const pageTitle = document.createElement('h1');
    pageTitle.style.justifySelf = "center";
    pageTitle.setAttribute('class', 'content-title');
    const titleText = document.createTextNode("Processing Request");
    pageTitle.appendChild(titleText);

    const titleElement = document.getElementById('title-wrapper');
    titleElement.style.justifySelf = "center";
    titleElement.style.alignSelf = "center";
    titleElement.style.paddingTop = "200px";
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
    let createRGURL = 'https://management.azure.com'.concat(subscriptionID, '/resourcegroups/', RGName, '?api-version=2021-04-01');

    let token = sessionStorage.getItem('MyToken');

    let header = new Headers();
    header.append('Authorization', `Bearer ${token}`);
    header.append('Content-type', 'application/json');

    let bodyJSON = '{location: "'.concat(RGlocation, '"}');
    
    let createRGRequest = new Request(createRGURL, {
        method: 'PUT',
        mode: 'cors',
        headers: header,
        body: bodyJSON
    });

    async function createRG() {
        let created = false;
        fetch(createRGRequest)
        .then(response => response.json())
        .then(data => {
            created = true;
        })
        .catch(error => {
            console.error(error.message);
        });

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(created);
                }, 2000);
        })
    }

    async function goBack() {
        const changeStatus = await createRG();

        if (changeStatus) {
            window.location.hash = '#resource-groups-home';
            location.reload();
        }
    }

    goBack();
}

let sendServerRequest = (ev) => { 
    const subscriptionID = sessionStorage.getItem('subID');
    let ServerInfo;

    let ServerURL = 'https://management.azure.com'.concat(subscriptionID, '/providers/Microsoft.Sql/servers?api-version=2021-11-01');
    let token = sessionStorage.getItem('MyToken');
    let header = new Headers();
    header.append('Authorization', `Bearer ${token}`);

    let ServerRequest = new Request(ServerURL, {
        method: 'GET',
        mode: 'cors',
        headers: header
    });

    //Create function that actually sends the request
    async function fetchServer() {
        fetch(ServerRequest)
        .then(response => response.json())
        .then(data => {
            ServerInfo = data;
        })
        .catch(error => {
            console.error(error.message);
        });

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(ServerInfo);
                }, 2000);
        })
    }

    async function addServerToHTML() {
        const ServerInfo = await fetchServer();

        //Create title and add to page
        const pageTitle = document.createElement('h1');
        pageTitle.setAttribute('class', 'content-title');
        const titleText = document.createTextNode("Servers");
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

        //Add each server info to page
        for(let i = 0; i < ServerInfo.value.length; i++) {

            //Create table entry
            const newEntry = document.createElement('tr');
            newEntry.setAttribute('class', 'content-entry');

            //Create element for Server name
            const nameElement = document.createElement('div');
            nameElement.setAttribute('class', 'content-name');
            const nameText = document.createTextNode(ServerInfo.value[i].name);
            nameElement.appendChild(nameText);
            newEntry.appendChild(nameElement);

            //Create database button (change to databases)

            const buttonElement = document.createElement('button');
            buttonElement.setAttribute('class', 'content-button');
            var buttonText;

            buttonText = document.createTextNode('Databases');
            buttonElement.addEventListener('click',() => {
                window.location.hash = '#DB-home$'.concat(ServerInfo.value[i].name, '$', ServerInfo.value[i].id.split('/')[4]);
                location.reload();
            })

            
            buttonElement.appendChild(buttonText);
            newEntry.appendChild(buttonElement);

            const tableElement = document.getElementById('content-list');
            tableElement.appendChild(newEntry);
        }
    }
    
    addServerToHTML();
}

//Call for Database
function sendDBRequest(serverName, resourceGroup) {
    const subscriptionID = sessionStorage.getItem('subID');
    let DBInfo;

    let DBURL = 'https://management.azure.com'.concat(subscriptionID, '/resourceGroups/', resourceGroup, '/providers/Microsoft.Sql/servers/', serverName, '/databases?api-version=2021-11-01');
    let token = sessionStorage.getItem('MyToken');
    let header = new Headers();
    header.append('Authorization', `Bearer ${token}`);

    let DBRequest = new Request(DBURL, {
        method: 'GET',
        mode: 'cors',
        headers: header
    });

    //Create function that actually sends the request
    async function fetchDB() {
        fetch(DBRequest)
        .then(response => response.json())
        .then(data => {
            DBInfo = data;
        })
        .catch(error => {
            console.error(error.message);
        });

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(DBInfo);
                }, 2000);
        })
    }

    async function addDBToHTML() {
        const DBInfo = await fetchDB();

        //Create title and add to page
        const pageTitle = document.createElement('h1');
        pageTitle.setAttribute('class', 'content-title');
        const titleText = document.createTextNode("Databases");
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

        //Add each Database info to page
        if(DBInfo.value.length > 0) {
            for(let i = 0; i < DBInfo.value.length; i++) {

                //Create table entry
                const newEntry = document.createElement('tr');
                newEntry.setAttribute('class', 'content-entry');

                //Create element for database name
                const nameElement = document.createElement('div');
                nameElement.setAttribute('class', 'content-name');
                const entryText = document.createTextNode(DBInfo.value[i].name);
                nameElement.appendChild(entryText);
                newEntry.appendChild(nameElement);

                //Create element for DB status
                const stateElement = document.createElement('div');
                stateElement.setAttribute('class', 'content-state');
                const stateText = document.createTextNode(DBInfo.value[i].properties.status);
                stateElement.appendChild(stateText);
                newEntry.appendChild(stateElement);

                const tableElement = document.getElementById('content-list');
                tableElement.appendChild(newEntry);
            }
        } else {
            const nameElement = document.createElement('div');
            nameElement.setAttribute('class', 'content-name');
            const entryText = document.createTextNode("No Databases");
            nameElement.appendChild(entryText);
            newEntry.appendChild(nameElement);
        }
    }
    
    addDBToHTML();
}

function changeDBStatusRequest(dbName, resourceGroup, server, dbRunning) {
    const subscriptionID = sessionStorage.getItem('subID');
    let changeStatusURL;
    let token = sessionStorage.getItem('MyToken');
    let header = new Headers();
    header.append('Authorization', `Bearer ${token}`);
    let changeStatusRequest

    if(dbRunning) {
        changeStatusURL = 'https://management.azure.com'.concat(subscriptionID, 
            '/resourceGroups/', resourceGroup, '/providers/Microsoft.Sql/servers/', server, '/databases/', dbName, 
            '/pause?api-version=2021-11-01');
        changeStatusRequest = new Request(changeStatusURL, {
            method: 'POST',
            mode: 'cors',
            headers: header
        });
    } else {
        changeStatusURL = 'https://management.azure.com'.concat(subscriptionID, 
            '/resourceGroups/', resourceGroup, '/providers/Microsoft.Sql/servers/', server, '/databases/', dbName, 
            '/resume?api-version=2021-11-01');
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
            statusChanged = true;
        })
        .catch(error => {
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
        if (changeStatus) {
            window.location.hash = '#DB-home';
            location.reload();
        }
    }

    goBack();
}

let sendStorageAccountRequest = () => {
    const subscriptionID = sessionStorage.getItem('subID');
    // Getting parameters needed to make the API call for Storage Accounts
    let storageAccountURL = 'https://management.azure.com'.concat(subscriptionID, '/providers/Microsoft.Storage/storageAccounts?api-version=2023-01-01');
    let token = sessionStorage.getItem('MyToken');
    let header = new Headers({'Authorization': `Bearer ${token}`});

    // Creating the request for Storage Accounts
    let request = new Request(storageAccountURL, {
        method: 'GET',
        mode: 'cors',
        headers: header
    });

    // Create function that actually sends the request for Storage Accounts
    async function fetchStorageAccounts() {
        let storageAccounts;
        try {
            let response = await fetch(request);
            let data = await response.json();
            storageAccounts = data;
        } catch (error) {
            console.error(error.message);
        }
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(storageAccounts);
            }, 2000);
        });
    }

    // Adds Storage Accounts info to HTML
    async function addStorageAccountToHTML() {
        const storageAccountInfo = await fetchStorageAccounts();

        // Create title and add to page
        const pageTitle = document.createElement('h1');
        pageTitle.setAttribute('class', 'content-title');
        const titleText = document.createTextNode("Storage Accounts");
        pageTitle.appendChild(titleText);
        const titleElement = document.getElementById('title-wrapper');
        titleElement.appendChild(pageTitle);

        // Add each Storage Account name to page
        if (storageAccountInfo.value.length > 0) {
            for (let i = 0; i < storageAccountInfo.value.length; i++) {
                const newEntry = document.createElement('tr');
                newEntry.setAttribute('class', 'content-entry');

                const nameElement = document.createElement('div');
                nameElement.setAttribute('class', 'content-name');
                const nameText = document.createTextNode(storageAccountInfo.value[i].name);
                nameElement.appendChild(nameText);
                newEntry.appendChild(nameElement);

                const tableElement = document.getElementById('content-list');
                tableElement.appendChild(newEntry);

                //Create delete element
                const deleteElement = document.createElement('button');
                deleteElement.setAttribute('class', 'content-button');

                //Add text
                const deleteText = document.createTextNode('Delete');
                deleteElement.appendChild(deleteText);

                //Event Listener
                deleteElement.addEventListener('click',() => {
                    window.location.hash = '#SA-delete$'.concat(storageAccountInfo.value[i].name, '$', storageAccountInfo.value[i].id.split('/')[4]);
                    location.reload();
                });

                newEntry.appendChild(deleteElement);
            }
        } else {
            const newEntry = document.createElement('tr');
            newEntry.setAttribute('class', 'content-entry');
            const entryText = document.createTextNode("No Storage Accounts");
            newEntry.appendChild(entryText);

            const tableElement = document.getElementById('content-list');
            tableElement.appendChild(newEntry);
        }
    }

    addStorageAccountToHTML();
}

function deleteStorageAccountRequest(storageAccountName, resourceGroup) {

    const pageTitle = document.createElement('h1');
    pageTitle.style.justifySelf = "center";
    pageTitle.setAttribute('class', 'content-title');
    const titleText = document.createTextNode("Processing Request");
    pageTitle.appendChild(titleText);

    const titleElement = document.getElementById('title-wrapper');
    titleElement.style.justifySelf = "center";
    titleElement.style.alignSelf = "center";
    titleElement.style.paddingTop = "200px";
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

    let deleteURL = 'https://management.azure.com'.concat(subscriptionID, 
    '/resourceGroups/', resourceGroup, '/providers/Microsoft.Storage/storageAccounts/', storageAccountName, 
    '?api-version=2023-01-01');;
    let token = sessionStorage.getItem('MyToken');
    let header = new Headers();
    header.append('Authorization', `Bearer ${token}`);

    let deleteRequest = new Request(deleteURL, {
        method: 'DELETE',
        mode: 'cors',
        headers: header
    });

    async function fetchDelete() {
        let deleteOperation;
        try {
            let response = await fetch(deleteRequest);
            deleteOperation = response.ok;
        } catch (error) {
            console.error(error.message);
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(deleteOperation);
            }, 2000);
        });
    }

    async function goBack() {
        const deleteOperation = await fetchDelete();
        if (deleteOperation) {
            window.location.hash = '#SA-home';
            location.reload();
        }
    }

    goBack();
}