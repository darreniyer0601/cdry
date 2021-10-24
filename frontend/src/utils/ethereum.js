const wei_constant = 1000000000000000000n;
const whale_public_key = "0xF28Ed35a4c8258dbe47Fb6b0C9644CEf46A59DD4";
var account;

function connectAccount() {
    if (typeof window.eth !== 'undefined') {
        var ethereum = window.eth;
        var accounts = await ethereum.request({method: 'eth_requestAccounts'})
        account = accounts[0]
        ethereum.on('accountsChanged', function(newAccounts) {
            accounts = newAccounts;
            account = accounts[0];
        })  
    } else {
        //code here for if metamask is not installed(alert or something maybe to install?)
    }
}

function sendEth(amountInEther) {
    if (account == undefined) {
        connectAccount();
    } else {
        var ethereum = window.eth;
        ethereum.request({
            method: 'eth_sendTransaction',
            params: [
                {
                    from: accounts[0],
                    to: whale_public_key,
                    value: (wei_constant*amountInEther).toString(16),
                    gas: '0x2710',
                },
            ],
        })
        .then((txHash) => console.log(txHash))
        .catch((error) => console.error);
    }
}