const wei_constant = 1000000000000000000n;
const whale_public_key = "0xF28Ed35a4c8258dbe47Fb6b0C9644CEf46A59DD4";
var account;

export async function connectAccount() {
	if (typeof window.ethereum !== "undefined") {
		var ethereum = window.ethereum;
		var accounts = await ethereum.request({ method: "eth_requestAccounts" });
		account = accounts[0];
		ethereum.on("accountsChanged", function (newAccounts) {
			accounts = newAccounts;
			account = accounts[0];
		});
        return account;
	} else {
		throw new Error("MetaMask extension not added");
	}
}

export function sendEth(amountInEther) {
	if (typeof account == undefined) {
		connectAccount();
	} else {
		var ethereum = window.ethereum;
		ethereum
			.request({
				method: "eth_sendTransaction",
				params: [
					{
						from: account,
						to: whale_public_key,
						value: (wei_constant * amountInEther).toString(16),
						gas: "0x2710",
					},
				],
			})
			.then((txHash) => console.log(txHash))
			.catch((err) => console.error(err));
	}
}
