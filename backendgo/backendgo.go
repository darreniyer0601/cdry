//cdry is the best group ever created :)
package main

import (
	"bytes"
	"crypto/ecdsa"
	"encoding/hex"
	"fmt"
	"log"
	"math/big"
	"strings"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/valyala/fasthttp"
)

const auth_key string = "AccessKey 80404752c1e3488a8be2c9a3bf2ed071:xLPsB0f7RSu4NcOR1g0o46Z40OzHE3QKBCG4SUCfV04p3oaOURyG8cn83O8sWmEEQV2YLrdqdJJEHg+daF6a/g=="
const nepOrganization string = "test-drive-e605ad46ec584ec5b0f25"
const whale_private_key string = "2786539f980c14de02e25ddb4982aaa3cf422437f9b6e37a30fb76c59e6a1389"
const whale_public_key string = "0xF28Ed35a4c8258dbe47Fb6b0C9644CEf46A59DD4"

var alchClient ethclient.Client

func signTransaction(privateKey *ecdsa.PrivateKey, nonce uint64, gasAmount uint64, maxFeePerGas *big.Int, maxPriorityFeePerGas *big.Int, toAddress string, amountInWei *big.Int, dataString string) string {
	var chainId big.Int = *big.NewInt(3)

	signer := types.NewLondonSigner(&chainId)

	receiverAddress := common.HexToAddress(toAddress)
	var data []byte

	if strings.HasPrefix(dataString, "0x") {
		data, _ = hex.DecodeString(dataString[2:])
	} else {
		data = nil
	}

	fmt.Printf("Account nonce: %x\n", nonce)

	tx := types.NewTx(&types.DynamicFeeTx{
		ChainID:   &chainId,
		Nonce:     nonce,
		Gas:       gasAmount,
		GasFeeCap: maxFeePerGas,
		GasTipCap: maxPriorityFeePerGas,
		To:        &receiverAddress,
		Value:     amountInWei,
		Data:      data,
	})

	signedTx, err := types.SignTx(tx, signer, privateKey)

	if err != nil {
		log.Fatal(err)
	}

	retBytes, _ := signedTx.MarshalBinary()

	return fmt.Sprintf("0x%x", retBytes)
}

func transferToken() {

}

func getAllWhaleNfts() {

}

func main() {
	client, err := ethclient.Dial("https://eth-ropsten.alchemyapi.io/v2/xzMGhvYooHNhBrleEcuiX_CZiAkbDN_S")
	if err != nil {
		log.Fatal(err)
	}
	alchClient = *client

}

func getRequest(reqUri string, headers ...map[string]string) ([]byte, error) {
	req := fasthttp.AcquireRequest()
	defer fasthttp.ReleaseRequest(req)

	req.SetRequestURI(reqUri)
	req.Header.SetMethod("GET")
	for i := 0; i < len(headers); i++ {
		curHeaderList := headers[i]
		for key, value := range curHeaderList {
			if strings.ToLower(key) == "content-type" {
				req.Header.SetContentType(value)
			} else {
				req.Header.Add(key, value)
			}
		}
	}

	resp := fasthttp.AcquireResponse()
	defer fasthttp.ReleaseResponse(resp)

	err := fasthttp.Do(req, resp)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode() != fasthttp.StatusOK {
		fmt.Printf("Request returned status: %d\n", resp.StatusCode())
		return nil, fmt.Errorf("status code: %d", resp.StatusCode())
	}

	contentEncoding := resp.Header.Peek("Content-Encoding")
	var respBody []byte
	if bytes.EqualFold(contentEncoding, []byte("gzip")) {
		respBody, _ = resp.BodyGunzip()
	} else {
		respBody = resp.Body()
	}
	return respBody, nil
}

func posRequest(reqUri string, postData []byte, headers ...map[string]string) ([]byte, error) {
	req := fasthttp.AcquireRequest()
	defer fasthttp.ReleaseRequest(req)

	contentType := "application/json"
	req.SetRequestURI(reqUri)
	req.Header.SetMethod("POST")
	req.Header.Add("Accept", "*")
	for i := 0; i < len(headers); i++ {
		curHeaderList := headers[i]
		for key, value := range curHeaderList {
			if strings.ToLower(key) == "content-type" {
				contentType = value
			} else {
				req.Header.Add(key, value)
			}
		}
	}
	req.Header.SetContentType(contentType)
	req.SetBody(postData)

	resp := fasthttp.AcquireResponse()
	defer fasthttp.ReleaseResponse(resp)

	err := fasthttp.Do(req, resp)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode() != fasthttp.StatusOK {
		fmt.Printf("Request returned status: %d\n", resp.StatusCode())
		return nil, fmt.Errorf("status code: %d", resp.StatusCode())
	}

	contentEncoding := resp.Header.Peek("Content-Encoding")
	var respBody []byte
	if bytes.EqualFold(contentEncoding, []byte("gzip")) {
		respBody, _ = resp.BodyGunzip()
	} else {
		respBody = resp.Body()
	}
	return respBody, nil
}
