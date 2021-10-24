//cdry is the best group ever created :)
package main

import (
	"bytes"
	"context"
	"crypto/ecdsa"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"strconv"
	"strings"
	"time"

	"github.com/darreniyer0601/cdry/backendgo/models"
	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/valyala/fasthttp"
)

const auth_key string = "AccessKey 80404752c1e3488a8be2c9a3bf2ed071:xLPsB0f7RSu4NcOR1g0o46Z40OzHE3QKBCG4SUCfV04p3oaOURyG8cn83O8sWmEEQV2YLrdqdJJEHg+daF6a/g=="
const nepOrganization string = "test-drive-e605ad46ec584ec5b0f25"
const whale_nft_contract_address string = "0xf7301db146414e2db34eaad61ef9e76e76a2237a"
const whale_private_key string = "2786539f980c14de02e25ddb4982aaa3cf422437f9b6e37a30fb76c59e6a1389"
const whale_public_key string = "0xF28Ed35a4c8258dbe47Fb6b0C9644CEf46A59DD4"
const etherscan_api_key string = "W4JAHDFHJDG1REYJ82JI1GVW99P5UUTSJ4"
const etherscan_api_route string = "https://api-ropsten.etherscan.io/api"

var alchClient ethclient.Client
var heldTokenData []models.TokenData = make([]models.TokenData, 0)

func stringArrayContains(givenArr []string, value string) bool {
	for i := 0; i < len(givenArr); i++ {
		if givenArr[i] == value {
			return true
		}
	}
	return false
}
func removeFromStringArray(givenArray []string, value string) []string {
	for i := 0; i < len(givenArray); i++ {
		if givenArray[i] == value {
			return append(givenArray[:i], givenArray[i+1:]...)
		}
	}
	return givenArray
}

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

func getAllWhaleNftIds() ([]string, error) {
	retBytes, err := getRequest("https://api-ropsten.etherscan.io/api?module=account&action=tokennfttx&contractaddress=" + whale_nft_contract_address + "&address=" + whale_public_key + "&apikey=" + etherscan_api_key + "&sort=asc")
	if err != nil {
		log.Fatal(err)
		return nil, err
	}
	var retData models.EtherscanData
	json.Unmarshal(retBytes, &retData)
	var tokenData []models.GetTokenResult
	for i := 0; i < len(retData.Result); i++ {
		var curTokenData models.GetTokenResult
		json.Unmarshal(retData.Result[i], &curTokenData)
		tokenData = append(tokenData, curTokenData)
	}
	finalArray := make([]string, 0)
	for i := 0; i < len(tokenData); i++ {
		curTokenData := tokenData[i]
		fromAddy := curTokenData.From
		if fromAddy != whale_public_key {
			finalArray = append(finalArray, curTokenData.TokenID)
		} else {
			if stringArrayContains(finalArray, curTokenData.TokenID) {
				removeFromStringArray(finalArray, curTokenData.TokenID)
			}
		}
	}
	fmt.Println(finalArray)
	return finalArray, nil
}

func getUriFromToken(tokenId string, contractId string) (string, error) {
	intTokenId, err := strconv.ParseInt(tokenId, 10, 32)
	if err != nil {
		log.Fatal(err)
		return "", err
	}
	dataHexString := fmt.Sprintf("c87b56dd%064x", intTokenId)
	data, err := hex.DecodeString(dataHexString)
	if err != nil {
		log.Fatal(err)
		return "", err
	}
	contract_common_address := common.HexToAddress(whale_nft_contract_address)
	retData, err := alchClient.CallContract(context.Background(), ethereum.CallMsg{
		Data: data,
		From: common.HexToAddress("0x0000000000000000000000000000000000000000"),
		To:   &contract_common_address,
	}, nil)
	if err != nil {
		log.Fatal(err)
		return "", err
	}
	retData = bytes.Trim(retData, "\x00")
	retString := string(retData)
	for i := 0; i < len(retString); i++ {
		if retString[i] != 'h' && !(retString[i+1] == 't' && retString[i+2] == 't' && retString[i+3] == 'p') {

		} else {
			retString = retString[i:]
			break
		}
	}
	fmt.Println(retString)
	return retString, nil
}

func getDataFromToken(tokenUri string, tokenId string) (models.TokenData, error) {
	var finalData models.TokenData
	retBytes, err := getRequest(tokenUri)
	if err != nil {
		log.Fatal(err)
		return finalData, err
	}
	var retData models.DirectTokenData
	err = json.Unmarshal(retBytes, &retData)
	if err != nil {
		log.Fatal(err)
		return finalData, err
	}
	finalData = models.TokenData{
		Name:        retData.Name,
		Description: retData.Description,
		Image:       retData.Image,
		TokenId:     tokenId,
	}
	return finalData, nil
}

func updateWhaleTokenData() error {
	retIds, err := getAllWhaleNftIds()
	if err != nil {
		log.Fatal(err)
		return err
	}
	var finalData []models.TokenData
	for i := 0; i < len(retIds); i++ {
		curId := retIds[i]
		tokenUri, err := getUriFromToken(curId, whale_nft_contract_address)
		if err != nil {
			log.Fatal(err)
			return err
		}
		tokenData, err := getDataFromToken(tokenUri, curId)
		if err != nil {
			log.Fatal(err)
			return err
		}
		finalData = append(finalData, tokenData)
	}
	heldTokenData = finalData
	return nil
}

func getTokensHandler(ctx *fasthttp.RequestCtx) {
	ctx.SetContentType("application/json")
	ctx.SetStatusCode(fasthttp.StatusOK)
	err := updateWhaleTokenData()
	if err != nil {
		fmt.Printf("[%s] Error updating whale token data\n", time.Now().Format(time.RFC850))
	}
	x, err := json.Marshal(heldTokenData)
	if err != nil {
		fmt.Println(err)
		fmt.Fprint(ctx, err)
		ctx.SetStatusCode(fasthttp.StatusInternalServerError)
	} else {
		ctx.SetBody(x)
	}
}

func handler(reqCtx *fasthttp.RequestCtx) {
	switch string(reqCtx.Path()) {
	case "/get-whale-tokens":
		getTokensHandler(reqCtx)
	default:
		reqCtx.Error("Unsupported path", fasthttp.StatusNotFound)
	}
}

func main() {
	client, err := ethclient.Dial("https://eth-ropsten.alchemyapi.io/v2/xzMGhvYooHNhBrleEcuiX_CZiAkbDN_S")
	if err != nil {
		log.Fatal(err)
	}
	alchClient = *client
	fasthttp.ListenAndServe(":8080", handler)
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
