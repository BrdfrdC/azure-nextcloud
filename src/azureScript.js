document.addEventListener('DOMContentLoaded', () => {
    sessionStorage.setItem("MyToken", 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyIsImtpZCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyJ9.eyJhdWQiOiJodHRwczovL21hbmFnZW1lbnQuY29yZS53aW5kb3dzLm5ldCIsImlzcyI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0L2FjNzllNWE4LWUwZTQtNDM0Yi1hMjkyLTJjODliNWMyODM2Ni8iLCJpYXQiOjE2OTYyNjkwMzIsIm5iZiI6MTY5NjI2OTAzMiwiZXhwIjoxNjk2MjczMzA5LCJhY3IiOiIxIiwiYWlvIjoiQVRRQXkvOFVBQUFBL1VnR3duYVVzaW1ocmVYbTg4Sk5IVUNGaVpSQlRjYldDOUVkbHIvRjB3R0Q0aXBMVGE1akQwMWhKTTZKdERyWiIsImFtciI6WyJwd2QiXSwiYXBwaWQiOiIxOGZiY2ExNi0yMjI0LTQ1ZjYtODViMC1mN2JmMmIzOWIzZjMiLCJhcHBpZGFjciI6IjAiLCJmYW1pbHlfbmFtZSI6IkNvbnN1ZWdyYSIsImdpdmVuX25hbWUiOiJCcmFkbGV5IiwiZ3JvdXBzIjpbIjU0MWI0OTA0LTljYjAtNGMyNC04Zjk3LTVlMzIxNjc2NDhmMiIsIjExZGYyMDEwLTk1NTgtNDBjYy1hNDg2LWJhMWI0NDdmNDRmNSIsImE1YjIyOWQwLWE5N2YtNGE5Yi1iZGYyLTE4YTAxZWQxMGExNyJdLCJpZHR5cCI6InVzZXIiLCJpcGFkZHIiOiIyNjAwOjE3MDA6Mzg3MDo1MjYwOjJkN2Y6ZTllYjo2YjA1OjNlMGQiLCJuYW1lIjoiQnJhZGxleSBDb25zdWVncmEiLCJvaWQiOiJmZTIyZTgzOC04MDRkLTQ1ZTQtOGRhYS05MzhkZDlhOWZmZTQiLCJvbnByZW1fc2lkIjoiUy0xLTUtMjEtMTkyOTA4MzIyNS0yMzgwMzEwMTU1LTMyNDQ0NzkxOTEtNzgzNDAwIiwicHVpZCI6IjEwMDMyMDAwQjZDMzA0RTkiLCJyaCI6IjAuQVZzQXFPVjVyT1RnUzBPaWtpeUp0Y0tEWmtaSWYza0F1dGRQdWtQYXdmajJNQk5iQVBnLiIsInNjcCI6InVzZXJfaW1wZXJzb25hdGlvbiIsInN1YiI6IlZJRll2S05jVk1MNlc1ZkFEc2NJc1BVUzhjRUhzMTFzVmIxUzhzVm8xcUkiLCJ0aWQiOiJhYzc5ZTVhOC1lMGU0LTQzNGItYTI5Mi0yYzg5YjVjMjgzNjYiLCJ1bmlxdWVfbmFtZSI6ImJjb25zMDEwQGZpdS5lZHUiLCJ1cG4iOiJiY29uczAxMEBmaXUuZWR1IiwidXRpIjoiMmt1UGdRczlxa1d6WDJYZW52a3NBQSIsInZlciI6IjEuMCIsIndpZHMiOlsiYjc5ZmJmNGQtM2VmOS00Njg5LTgxNDMtNzZiMTk0ZTg1NTA5Il0sInhtc190Y2R0IjoxMzQ5Mzg0MzczfQ.rDfn5BLcfdWD3_HmRVEL5FWGdntCHlGwhHmUx1xaNJkFV-cWq5UfKhyPo4rQP-_8KVIP1tWjqAl8U9iQXWFXl7ZnVofn53G3cNtY1fTSOwdNB0zT_v3JKvYRiYhrcZjH67C8s6VWMCCPyEnmrXezYHyP93Oj1I-3x4NWvg4d3RoIZnTXGZ6u43Dk2_yqYOtQl8Kkves-kqb3Y7MZHcJG1pFgQk1PrZzzEjpT9qBJxAmcW3GnF5HFU-vq36Dc6JHKoJ6rHJopPiQes9UHx9lxZyVtoFfAoIkYejlEOduTuGoyLaqOJZnr-NEZ3FuUudLI9GkM5sl-uljktqrEo7oc1g');
    sendRequest();
})

let sendRequest = (ev) => {

    let subscriptionURL = 'https://management.azure.com/subscriptions?api-version=2022-12-01';
    let token = sessionStorage.getItem("MyToken");
    let header = new Headers();
    header.append('Authentication', `Bearer ${token}`);
    header.append('Authorization', `Bearer ${token}`);

    let request = new Request(subscriptionURL, {
        method: "GET",
        mode: "cors",
        headers: header
    });

    function fetchSubscriptionID() {
        let subID;
        fetch(request)
            .then(response => response.json())
            .then(data => {
                subID = data.value[0].id;
            })
            .catch(error => {
                console.error(error.message);
            });
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(subID);
                }, 1000);
        })
    }

    async function fetchVM() {
        const subscriptionID = await fetchSubscriptionID();
        console.log(subscriptionID);
        let VMInfo;

        let vmURL = 'https://management.azure.com'.concat(subscriptionID, '/providers/Microsoft.Compute/virtualMachines?api-version=2023-07-01');

        let vmRequest = new Request(vmURL, {
            method: "GET",
            mode: "cors",
            headers: header
        });

        fetch(vmRequest)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                VMInfo = data;
            })
            .catch(error => {
                console.error(error.message);
            });

            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(VMInfo);
                    }, 1000);
            })
    }

    async function addToHTML() {
        const VMInfo = await fetchVM();

        for(let i = 0; i < VMInfo.value.length; i++) {
            console.log(VMInfo.value[i].name);
            const newEntry = document.createElement("div");
            const entryText = document.createTextNode(VMInfo.value[i].name);
            newEntry.appendChild(entryText);
            document.body.insertBefore(newEntry, document.getElementById("vm-footer"));
        }
    }
    
    addToHTML();
}