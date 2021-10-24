package models

import "encoding/json"

type EtherscanData struct {
	Status  string            `json:"status"`
	Message string            `json:"message"`
	Result  []json.RawMessage `json:"result"`
}

type GetTokenResult struct {
	TokenID string `json:"tokenID"`
	From    string `json:"from"`
}

type DirectTokenData struct {
	Description string `json:"description"`
	Image       string `json:"image"`
	Name        string `json:"name"`
}

type TokenData struct {
	TokenId     string `json:"tokenID"`
	Image       string `json:"image"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

type PurchaseOrder struct {
	TokenIDs           []string `json:"tokenIDs"`
	TransactionHash    string   `json:"transactionHash"`
	DestinationAddress string   `json:"destinationAddress"`
}
