var s = document.createElement('script');
// must be listed in web_accessible_resources in manifest.json
s.src = chrome.runtime.getURL('index.js');
s.async = true;
s.referrerpolicy='same-origin'

chrome.storage.onChanged.addListener(changes=>{
    if(changes.SNHeaders){
        localStorage.setItem("SNHeaders",JSON.stringify(changes.SNHeaders.newValue))
    }
    if(changes.tabLimit){

        localStorage.setItem("tabLimit",changes.tabLimit.newValue)
    }
})

chrome.storage.local.get(['tabRuleObj','urlsToBeMade',"interceptArr",
'jtoken','salesUrlToBeMade','SNHeaders','tabLimit'],res=>{
    console.log('Running');
    if(res.tabRuleObj || res.urlsToBeMade || res.salesUrlToBeMade){
        console.log(res);
        let {tabRuleObj,urlsToBeMade,jtoken,salesUrlToBeMade,SNHeaders,tabLimit,interceptArr}=res

        addEventListener("storage", (event) => {
            console.log(event)
            console.log(event.key=='interceptArr')
            if(event.key=='interceptArr'){
                console.log(event);
            }
        })
     

        tabRuleObj?localStorage.setItem("tabRuleObj",JSON.stringify(tabRuleObj)):null
        urlsToBeMade?localStorage.setItem("urlsToBeMade",JSON.stringify(urlsToBeMade)):null
        salesUrlToBeMade?localStorage.setItem("salesUrlToBeMade",JSON.stringify(salesUrlToBeMade)):null
        SNHeaders?localStorage.setItem("SNHeaders",JSON.stringify(SNHeaders)):null
        tabLimit?localStorage.setItem("tabLimit",tabLimit):null
        console.log(tabLimit);

        localStorage.setItem("interceptArr",interceptArr?JSON.stringify(interceptArr):JSON.stringify([]))
        localStorage.setItem("sentIntercepted",JSON.stringify([]))
        localStorage.setItem("urlsToBeReturned",JSON.stringify([]))
        localStorage.setItem("salesUrlsToBeReturned",JSON.stringify([]))
        localStorage.setItem("jtoken",jtoken)
        localStorage.setItem("allIntercepted",JSON.stringify([]))
        
        s.onload = function() {
            // this.remove();
        };
        (document.head || document.documentElement).appendChild(s);
    }
})