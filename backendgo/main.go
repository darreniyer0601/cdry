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
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/darreniyer0601/cdry/backendgo/models"
	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/valyala/fasthttp"
)

const ncr_auth_key string = "AccessKey 80404752c1e3488a8be2c9a3bf2ed071:xLPsB0f7RSu4NcOR1g0o46Z40OzHE3QKBCG4SUCfV04p3oaOURyG8cn83O8sWmEEQV2YLrdqdJJEHg+daF6a/g=="
const nepOrganization string = "test-drive-5facf94d431942c989d49" //old-nep test-drive-e605ad46ec584ec5b0f25
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
	ret := make([]string, 0)
	for i := 0; i < len(givenArray); i++ {
		if givenArray[i] == value {
			ret = append(givenArray[:i], givenArray[i+1:]...)
			break
		}
	}
	return ret
}

func signTransaction(privateKey *ecdsa.PrivateKey, nonce uint64, gasAmount uint64, maxFeePerGas *big.Int, maxPriorityFeePerGas *big.Int, toAddress string, amountInWei *big.Int, dataString string) (string, error) {
	var chainId big.Int = *big.NewInt(3)

	signer := types.NewLondonSigner(&chainId)

	receiverAddress := common.HexToAddress(toAddress)

	fmt.Printf("Account nonce: %x\n", nonce)

	var data []byte

	if strings.HasPrefix(dataString, "0x") {
		data, _ = hex.DecodeString(dataString[2:])
	} else {
		data = nil
	}

	gasuint64, err := alchClient.EstimateGas(context.Background(), ethereum.CallMsg{
		From:  common.HexToAddress(whale_public_key),
		To:    &receiverAddress,
		Value: amountInWei,
		Data:  data,
	})

	if err != nil {
		fmt.Printf("[%s][Error] %s\n", time.Now().Format(time.RFC850), err)
		return "", err
	}

	suggestedGasPrice, err := alchClient.SuggestGasPrice(context.Background())

	if err != nil {
		fmt.Printf("[%s][Error] %s\n", time.Now().Format(time.RFC850), err)
		return "", err
	}

	suggestedGasTip, err := alchClient.SuggestGasTipCap(context.Background())

	if err != nil {
		fmt.Printf("[%s][Error] %s\n", time.Now().Format(time.RFC850), err)
		return "", err
	}

	tx := types.NewTx(&types.DynamicFeeTx{
		ChainID:   &chainId,
		Nonce:     nonce,
		Gas:       gasuint64,
		GasFeeCap: suggestedGasPrice,
		GasTipCap: suggestedGasTip,
		To:        &receiverAddress,
		Value:     amountInWei,
		Data:      data,
	})

	signedTx, err := types.SignTx(tx, signer, privateKey)

	if err != nil {
		fmt.Printf("[%s][Error] %s\n", time.Now().Format(time.RFC850), err)
		return "", err
	}

	retBytes, _ := signedTx.MarshalBinary()

	return fmt.Sprintf("0x%x", retBytes), nil
}

func sendTransaction(privateKey *ecdsa.PrivateKey, nonce uint64, fromAddress string, toAddress string, amountInWei *big.Int, dataString string) error {
	var chainId big.Int = *big.NewInt(3)

	receiverAddress := common.HexToAddress(toAddress)

	fmt.Printf("Account nonce: %x\n", nonce)

	var data []byte

	if strings.HasPrefix(dataString, "0x") {
		data, _ = hex.DecodeString(dataString[2:])
	} else {
		data = nil
	}

	gasuint64, err := alchClient.EstimateGas(context.Background(), ethereum.CallMsg{
		From:  common.HexToAddress(fromAddress),
		To:    &receiverAddress,
		Value: amountInWei,
		Data:  data,
	})

	if err != nil {
		fmt.Printf("[%s][Error] %s\n", time.Now().Format(time.RFC850), err)
		return err
	}

	suggestedGasPrice, err := alchClient.SuggestGasPrice(context.Background())

	if err != nil {
		fmt.Printf("[%s][Error] %s\n", time.Now().Format(time.RFC850), err)
		return err
	}

	suggestedGasTip, err := alchClient.SuggestGasTipCap(context.Background())

	if err != nil {
		fmt.Printf("[%s][Error] %s\n", time.Now().Format(time.RFC850), err)
		return err
	}

	tx := types.NewTx(&types.DynamicFeeTx{
		ChainID:   &chainId,
		Nonce:     nonce,
		Gas:       gasuint64,
		GasFeeCap: suggestedGasPrice,
		GasTipCap: suggestedGasTip,
		To:        &receiverAddress,
		Value:     amountInWei,
		Data:      data,
	})

	signer := types.NewLondonSigner(&chainId)

	signedTx, err := types.SignTx(tx, signer, privateKey)

	if err != nil {
		fmt.Printf("[%s][Error] %s\n", time.Now().Format(time.RFC850), err)
		return err
	}

	err = alchClient.SendTransaction(context.Background(), signedTx)

	fmt.Println(err)

	return err
}

func transferToken(contractAddress string, tokenId string, privateKey string, fromAddress string, toAddress string) error {
	fromAddress = strings.TrimPrefix(fromAddress, "0x")
	toAddress = strings.TrimPrefix(toAddress, "0x")

	intTokenId, err := strconv.ParseInt(tokenId, 10, 32)
	if err != nil {
		fmt.Printf("[%s][Error] %s\n", time.Now().Format(time.RFC850), err)
		return err
	}
	tokenPadding := fmt.Sprintf("%064x", intTokenId)
	data := "0x23b872dd000000000000000000000000" + fromAddress + "000000000000000000000000" + toAddress + tokenPadding
	retNonce, err := alchClient.NonceAt(context.Background(), common.HexToAddress(fromAddress), nil)
	if err != nil {
		fmt.Printf("[%s][Error] %s\n", time.Now().Format(time.RFC850), err)
		return err
	}
	ecdsa, err := crypto.HexToECDSA(privateKey)
	if err != nil {
		fmt.Printf("[%s][Error] %s\n", time.Now().Format(time.RFC850), err)
		return err
	}
	err = sendTransaction(ecdsa, retNonce, fromAddress, contractAddress, big.NewInt(0), data)
	//2021/10/24 02:37:21 execution reverted: ERC721: transfer caller is not owner nor approved
	return err
}

func getAllWhaleNftIds() ([]string, error) {
	retBytes, err := getRequest("https://api-ropsten.etherscan.io/api?module=account&action=tokennfttx&contractaddress=" + whale_nft_contract_address + "&address=" + whale_public_key + "&apikey=" + etherscan_api_key + "&sort=asc")
	if err != nil {
		fmt.Printf("[%s][Error] %s\n", time.Now().Format(time.RFC850), err)
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
		fromAddy := strings.ToLower(curTokenData.From)
		if fromAddy != strings.ToLower(whale_public_key) {
			finalArray = append(finalArray, curTokenData.TokenID)
		} else {
			if stringArrayContains(finalArray, curTokenData.TokenID) {
				finalArray = removeFromStringArray(finalArray, curTokenData.TokenID)
			}
		}
	}
	sort.Strings(finalArray)
	return finalArray, nil
}

func getUriFromToken(tokenId string, contractId string) (string, error) {
	intTokenId, err := strconv.ParseInt(tokenId, 10, 32)
	if err != nil {
		fmt.Printf("[%s][Error] %s\n", time.Now().Format(time.RFC850), err)
		return "", err
	}
	dataHexString := fmt.Sprintf("c87b56dd%064x", intTokenId)
	data, err := hex.DecodeString(dataHexString)
	if err != nil {
		fmt.Printf("[%s][Error] %s\n", time.Now().Format(time.RFC850), err)
		return "", err
	}
	contract_common_address := common.HexToAddress(whale_nft_contract_address)
	retData, err := alchClient.CallContract(context.Background(), ethereum.CallMsg{
		Data: data,
		From: common.HexToAddress("0x0000000000000000000000000000000000000000"),
		To:   &contract_common_address,
	}, nil)
	if err != nil {
		fmt.Printf("[%s][Error] %s\n", time.Now().Format(time.RFC850), err)
		return "", err
	}
	retData = bytes.Trim(retData, "\x00")
	retString := string(retData)
	for i := 0; i < len(retString); i++ {
		if retString[i] != 'h' && !(retString[i+1] == 't' && retString[i+2] == 't' && retString[i+3] == 'p') {

		} else {
			retString = retString[i:]
			retString = strings.Replace(retString, "https://gateway.pinata.cloud/ipfs/", "https://ipfs.io/ipfs/", 1)
			break
		}
	}
	return retString, nil
}

func getDataFromToken(tokenUri string, tokenId string) (models.TokenData, error) {
	var finalData models.TokenData
	retBytes, err := getRequest(tokenUri)
	if err != nil {
		fmt.Printf("[%s][Error] %s\n", time.Now().Format(time.RFC850), err)
		return finalData, err
	}
	var retData models.DirectTokenData
	err = json.Unmarshal(retBytes, &retData)
	if err != nil {
		fmt.Printf("[%s][Error] %s\n", time.Now().Format(time.RFC850), err)
		return finalData, err
	}
	imageUrl := retData.Image
	imageUrl = strings.Replace(imageUrl, "https://gateway.pinata.cloud/ipfs/", "https://ipfs.io/ipfs/", 1)
	finalData = models.TokenData{
		Name:        retData.Name,
		Description: retData.Description,
		Image:       imageUrl,
		TokenId:     tokenId,
	}
	return finalData, nil
}

func filterSignableContent(content []string, f func(string) bool) []string {
	cf := make([]string, 0)
	for _, c := range content {
		if f(c) {
			cf = append(cf, c)
		}
	}
	return cf
}

func updateWhaleTokenData() error {
	retIds, err := getAllWhaleNftIds()
	if err != nil {
		fmt.Printf("[%s][Error] %s\n", time.Now().Format(time.RFC850), err)
		return err
	}
	var finalData []models.TokenData
	for i := 0; i < len(retIds); i++ {
		curId := retIds[i]
		tokenUri, err := getUriFromToken(curId, whale_nft_contract_address)
		if err != nil {
			fmt.Printf("[%s][Error] %s\n", time.Now().Format(time.RFC850), err)
			return err
		}
		tokenData, err := getDataFromToken(tokenUri, curId)
		if err != nil {
			fmt.Printf("[%s][Error] %s\n", time.Now().Format(time.RFC850), err)
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
		fmt.Printf("[%s][Error] Error updating whale token data\n", time.Now().Format(time.RFC850))
	}
	x, err := json.Marshal(heldTokenData)
	if err != nil {
		fmt.Printf("[%s][Error] %s\n", time.Now().Format(time.RFC850), err)
		fmt.Fprint(ctx, err)
		ctx.SetStatusCode(fasthttp.StatusInternalServerError)
	} else {
		ctx.SetBody(x)
	}
}

func purchaseTokensHandler(ctx *fasthttp.RequestCtx) {
	ctx.SetContentType("application/json")
	ctx.SetStatusCode(fasthttp.StatusOK)
	var reqOrder models.PurchaseOrder
	err := json.Unmarshal(ctx.Request.Body(), &reqOrder)
	if err != nil {
		fmt.Printf("[%s][Error] %s\n", time.Now().Format(time.RFC850), err)
		fmt.Fprint(ctx, err)
		ctx.SetStatusCode(fasthttp.StatusInternalServerError)
	} else {
		tokenIds := reqOrder.TokenIDs
		for i := 0; i < len(tokenIds); i++ {
			err = transferToken(whale_nft_contract_address, tokenIds[i], whale_private_key, whale_public_key, reqOrder.DestinationAddress)
			if err != nil {
				fmt.Printf("[%s][Error] %s\n", time.Now().Format(time.RFC850), err)
			}
		}
		ctx.SetBody([]byte("ok"))
	}
}

func handler(reqCtx *fasthttp.RequestCtx) {
	switch string(reqCtx.Path()) {
	case "/get-whale-tokens":
		getTokensHandler(reqCtx)
	case "/purchase-tokens":
		purchaseTokensHandler(reqCtx)
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
		fmt.Println(string(resp.Body()))
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
