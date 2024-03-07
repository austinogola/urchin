var s = document.createElement('script');
// must be listed in web_accessible_resources in manifest.json
s.src = chrome.runtime.getURL('injected.js');
s.async = true;
s.referrerpolicy='same-origin'

chrome.storage.onChanged.addListener(changes=>{
    if(changes.SNHeaders){
        localStorage.setItem("SNHeaders",JSON.stringify(changes.SNHeaders.newValue))
    }
})

chrome.storage.local.get(['tabRuleObj','urlsToBeMade','jtoken','salesUrlToBeMade','SNHeaders'],res=>{
    if(res.tabRuleObj || res.urlsToBeMade || res.salesUrlToBeMade){
        console.log(res);
        let {tabRuleObj,urlsToBeMade,jtoken,salesUrlToBeMade,SNHeaders}=res
     

        tabRuleObj?localStorage.setItem("tabRuleObj",JSON.stringify(tabRuleObj)):null
        urlsToBeMade?localStorage.setItem("urlsToBeMade",JSON.stringify(urlsToBeMade)):null
        salesUrlToBeMade?localStorage.setItem("salesUrlToBeMade",JSON.stringify(salesUrlToBeMade)):null
        SNHeaders?localStorage.setItem("SNHeaders",JSON.stringify(SNHeaders)):null

        localStorage.setItem("interceptArr",JSON.stringify([]))
        localStorage.setItem("sentIntercepted",JSON.stringify([]))
        localStorage.setItem("urlsToBeReturned",JSON.stringify([]))
        localStorage.setItem("salesUrlsToBeReturned",JSON.stringify([]))
        localStorage.setItem("jtoken",jtoken)
        
        s.onload = function() {
            this.remove();
        };
        (document.head || document.documentElement).appendChild(s);
    }
})