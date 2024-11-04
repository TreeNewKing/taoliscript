import dotenv from 'dotenv'
import {RestClientV5} from 'bybit-api'
dotenv.config()
// 输入自己的apikey和secret
const apikey=process.env.bybitkey
const apisecret=process.env.bybitsecret
const client = new RestClientV5({
    testnet: false,
    key: apikey,
    secret: apisecret,
});
// console.log(apikey)
// console.log(apisecret)

function getPosition(){

    const client = new RestClientV5({
        testnet: false,
        key: apikey,
        secret: apisecret,
    });
    
    client
        .getPositionInfo({
            category: 'inverse',
            // symbol: 'BTCUSD',
        })
        .then((response) => {
            console.log(response);
        })
        .catch((error) => {
            console.error(error);
        });
    
}
async function  getAssetInfo() {
    console.log(`-------------------【资金账户】-----------------------`)
  client
.getAllCoinsBalance({ accountType: 'FUND' })
.then((response) => {
var tokenArray=response.result.balance
for(let k in tokenArray){
    var coinItem=tokenArray[k]
    if(coinItem['walletBalance']>1){
    console.log(`【${coinItem['coin']}】\ntransferBalance=${coinItem['transferBalance']}\nwalletBalance${coinItem['walletBalance']}\nbonus${coinItem['bonus']}`)
    }
}
}).then(()=>{
console.log(`-------------------【交易账户】-----------------------`)
client
.getAllCoinsBalance({ accountType: 'UNIFIED' }).then((response)=>{
    var tokenArray=response.result.balance
for(let k in tokenArray){
    var coinItem=tokenArray[k]
    if(coinItem['walletBalance']>1){
    console.log(`【${coinItem['coin']}】\ntransferBalance=${coinItem['transferBalance']}\nwalletBalance${coinItem['walletBalance']}\nbonus${coinItem['bonus']}`)
    }
}
return tokenArray
}).catch((error) => {
    console.error(error);
  });


})
.catch((error) => {
console.error(error);
});
}
async function  buySCR(usdtNumberTobuy) {
    
    client
        .submitOrder({
            category: 'spot',
            symbol: 'SCRUSDT',
            side: 'Buy',
            orderType: 'Market',
            qty: usdtNumberTobuy,
            // price: '15600',
            // timeInForce: 'PostOnly',
            // orderLinkId: 'spot-test-postonly',
            // isLeverage: 0,
            // orderFilter: 'Order',
        })
        .then((response) => {
            if(response.retMsg=='OK'){
                console.log(`买入SCR现货成功【${usdtNumberTobuy}USDT】`)
            }
            // console.log(response);
        })
        .catch((error) => {
            console.error('SCR买入失败请检查头寸');
        });
}
async function shortSCR(SCRNumber) {
    client
        .submitOrder({
            category: 'linear',
            symbol: 'SCRUSDT',
            side: 'Sell',
            orderType: 'Market',
            qty: SCRNumber,
            // price: '15600',
            // timeInForce: 'PostOnly',
            // orderLinkId: 'spot-test-postonly',
            isLeverage: 1,
            // orderFilter: 'Order',
        })
        .then((response) => {
            if(response.retMsg=='OK'){
                console.log('成功使用合约Short',`【${SCRNumber}SCR】`);
            }else{
                console.log(response)
            }
           
        })
        .catch((error) => {
            console.error();
        });
    
}
async function getSCRHoldNumber() {
    return new Promise((resolve, reject) => {
        client.getAllCoinsBalance({ accountType: 'UNIFIED' }).then((response) => {
            var tokenArray = response.result.balance;
            for (let k in tokenArray) {
                var coinItem = tokenArray[k];
                if (coinItem['coin'] === 'SCR') {
                    let SCRBalance=Number(coinItem['transferBalance']).toFixed(1).toString()//保留小数点后一位
                    console.log(`需要对冲掉的SCR头寸为【${SCRBalance}SCR】`);
                    resolve(SCRBalance);
                    return;
                }
            }
        }).catch((error) => {
            console.error(error);
            reject(error);
        });
    });
}
function delay(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
async function main() {
    
    let usdtToBuySCR='5'//买入现货的头寸
    let SCRtoshort=''//买入后进行补充
    await buySCR(usdtToBuySCR)
    delay(500)
    SCRtoshort=await getSCRHoldNumber()
    // console.log('hh',SCRtoshort)
    // console.log(typeof SCRtoshort)
    await shortSCR(SCRtoshort)
    
}

// await getPosition()
// await buySCR('5')
// await buySCR('5')
// await shortSCR('5')
await main()


