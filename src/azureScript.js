import jwt_decode from "jwt-decode";

//Get URL and URL hash
var homeURL = window.location.href;
var URLhash = window.location.hash

//When page loads
document.addEventListener('DOMContentLoaded', () => {
    if((!URLhash && !sessionStorage.getItem('MyToken')) || (sessionStorage.getItem('MyToken') && (jwt_decode(sessionStorage.getItem('MyToken')).exp < Date.now() / 1000))) {
        sessionStorage.clear();
        oauth2Signin();
    } else if (URLhash == '#VM') {
        sendVMRequest();
    } else if (!sessionStorage.getItem('MyToken')) {
        URLhash = URLhash.replace('#access_token=','').split('&')[0];
        sessionStorage.setItem('MyToken', URLhash);
        sendSubRequest();
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

    if(sessionStorage.getItem('subID')) {
        return;
    }

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
    function fetchSubscriptionID() {
        let subID;
        fetch(request)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                subID = data.value[0].id;
                sessionStorage.setItem('subID', subID);
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
    fetchSubscriptionID();
}

var VMButton;
var VMDiv

if(!sessionStorage.getItem('subID')) {
    setTimeout(createVMButton, 2000);
} else {
    createVMButton();
}


function createVMButton() {
    if(sessionStorage.getItem('subID')) {
        var navElement = document.getElementById('app-navigation-vue');
    
        VMButton = document.createElement('a');
        VMButton.setAttribute('class', 'app-navigation-entry-link');
        VMDiv = document.createElement('div');
        VMDiv.setAttribute('class', 'app-navigation-entry');
    
        const entryText = document.createTextNode('Virtual Machines');
        VMButton.appendChild(entryText);
        VMDiv.appendChild(VMButton);
        navElement.appendChild(VMDiv);
        
        VMButton.addEventListener('click', () => {
            window.location.hash = '#VM';
            location.reload();
        });
    }
}

let sendVMRequest = (ev) => {
    const subscriptionID = sessionStorage.getItem('subID');
    let VMInfo;

    let vmURL = 'https://management.azure.com'.concat(subscriptionID, '/providers/Microsoft.Compute/virtualMachines?api-version=2023-07-01');
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

        for(let i = 0; i < VMInfo.value.length; i++) {
            const newEntry = document.createElement('tr');
            newEntry.setAttribute('class', 'content-entry');
            const entryText = document.createTextNode(VMInfo.value[i].name);
            newEntry.appendChild(entryText);

            const tableElement = document.getElementById('content-list');
            tableElement.appendChild(newEntry);
        }
    }
    
    addVMToHTML();
}