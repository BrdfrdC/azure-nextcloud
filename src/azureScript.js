import jwt_decode from "jwt-decode";

//Get URL and URL hash
var homeURL = window.location.href;
var URLhash = window.location.hash

//When page loads
document.addEventListener('DOMContentLoaded', () => {
    if(!URLhash) {
        oauth2Signin();
    } else {
        URLhash = URLhash.replace('#access_token=','').split('&')[0];
        sessionStorage.setItem('MyToken', URLhash);
        sendRequest();
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

let sendRequest = (ev) => {

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
        console.log(request);
        fetch(request)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                subID = data.value[0].id;
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

    //Create function that actually sends the request
    async function fetchVM() {
        const subscriptionID = await fetchSubscriptionID();
        sessionStorage.setItem('subID', subscriptionID);
        let VMInfo;

        let vmURL = 'https://management.azure.com'.concat(subscriptionID, '/providers/Microsoft.Compute/virtualMachines?api-version=2023-07-01');
        
        let vmRequest = new Request(vmURL, {
            method: 'GET',
            mode: 'cors',
            headers: header
        });

        console.log(vmRequest);

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

    async function addToHTML() {
        const VMInfo = await fetchVM();

        for(let i = 0; i < VMInfo.value.length; i++) {
            console.log(VMInfo.value[i].name);
            const newEntry = document.createElement('div');
            const entryText = document.createTextNode(VMInfo.value[i].name);
            newEntry.appendChild(entryText);
            document.body.insertBefore(newEntry, document.getElementById('vm-footer'));
        }
    }
    
    addToHTML();
}