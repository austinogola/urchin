var s = document.createElement('script');
// must be listed in web_accessible_resources in manifest.json
s.src = chrome.runtime.getURL('index.js');
s.async = true;
s.referrerpolicy='same-origin'

chrome.storage.onChanged.addListener(changes=>{
    if(changes.SNHeaders){
        localStorage.setItem("SNHeaders",JSON.stringify(changes.SNHeaders.newValue))
    }
    
})
// ['tabRuleObj','urlsToBeMade',"interceptArr",
// 'jtoken','salesUrlToBeMade','SNHeaders','tabLimit','listenToSales','salesDetails']


// let {tabRuleObj,urlsToBeMade,jtoken,salesUrlToBeMade,SNHeaders,
//     salesDetails,tabLimit,interceptArr,listenToSales}=res


chrome.storage.local.get(['interceptedArr','tabRuleObj','tabLimit','normRules',
'newToBeMade','jtoken','urlsToBeMade','listenToSales','salesDetails','interceptedSales'],res=>{
    if(true){
        const {normRules,interceptedArr,tabRuleObj,tabLimit,newToBeMade
            ,jtoken,salesDetails,listenToSales,interceptedSales}=res
  
       
        localStorage.setItem("tabLimit",tabLimit)
        localStorage.setItem("tabRuleObj",JSON.stringify(tabRuleObj))
        localStorage.setItem("interceptedArr",JSON.stringify(interceptedArr))
        localStorage.setItem("allIntercepted",JSON.stringify([]))

        // localStorage.setItem('urlsToBeMade',JSON.stringify(urlsToBeMade))
        // localStorage.setItem('urlsToBeReturned',JSON.stringify([]))
        
        localStorage.setItem('newToBeMade',JSON.stringify(newToBeMade))
        localStorage.setItem('newToBeReturned',JSON.stringify([]))
        localStorage.setItem('jtoken',jtoken)
        localStorage.setItem('listenToSales',listenToSales)

        localStorage.setItem("interceptedSales",JSON.stringify([]))
        // localStorage.setItem("salesUrlsToBeReturned",JSON.stringify([]))

        localStorage.setItem('listenToSales',listenToSales)
        localStorage.setItem('salesDetails',JSON.stringify(salesDetails))

        localStorage.setItem("normRules",JSON.stringify(normRules))

        s.onload = function() {
            // this.remove();
        };
        (document.head || document.documentElement).appendChild(s);
      
     

        // tabRuleObj?localStorage.setItem("tabRuleObj",JSON.stringify(tabRuleObj)):null
        // urlsToBeMade?localStorage.setItem("urlsToBeMade",JSON.stringify(urlsToBeMade)):null
        // salesUrlToBeMade?localStorage.setItem("salesUrlToBeMade",JSON.stringify(salesUrlToBeMade)):null
        // SNHeaders?localStorage.setItem("SNHeaders",JSON.stringify(SNHeaders)):null
        

        // localStorage.setItem("interceptArr",interceptArr?JSON.stringify(interceptArr):JSON.stringify([]))
        // localStorage.setItem("sentIntercepted",JSON.stringify([]))
        // localStorage.setItem("urlsToBeReturned",JSON.stringify([]))
        // 
        // localStorage.setItem("jtoken",jtoken)
        // 
        
       
       
    }
})