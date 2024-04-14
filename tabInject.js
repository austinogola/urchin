var s = document.createElement('script');

s.src = chrome.runtime.getURL('index.js');
s.async = true;
s.referrerpolicy='same-origin'

chrome.storage.onChanged.addListener(changes=>{
    if(changes.SNHeaders){
        localStorage.setItem("SNHeaders",JSON.stringify(changes.SNHeaders.newValue))
    }
    
})



chrome.storage.local.get(['interceptedArr','tabRuleObj','tabLimit','normRules',
'newToBeMade','jtoken','urlsToBeMade','listenToSales','salesDetails','interceptedSales'],res=>{
    if(true){
        const {normRules,interceptedArr,tabRuleObj,tabLimit,newToBeMade
            ,jtoken,salesDetails,listenToSales,interceptedSales}=res
  
       
        localStorage.setItem("tabLimit",tabLimit)
        localStorage.setItem("tabRuleObj",JSON.stringify(tabRuleObj))
        localStorage.setItem("interceptedArr",JSON.stringify(interceptedArr))
        localStorage.setItem("allIntercepted",JSON.stringify([]))
        
        console.log('interceptedArr',interceptedArr);
        
        localStorage.setItem('newToBeMade',JSON.stringify(newToBeMade))
        console.log('newToBeMade',newToBeMade);
        localStorage.setItem('newToBeReturned',JSON.stringify([]))
        localStorage.setItem('jtoken',jtoken)
        localStorage.setItem('listenToSales',listenToSales)

        localStorage.setItem("interceptedSales",JSON.stringify([]))
        localStorage.setItem("salesUrlsToBeReturned",JSON.stringify([]))

        localStorage.setItem('listenToSales',listenToSales)
        localStorage.setItem('salesDetails',JSON.stringify(salesDetails))

        localStorage.setItem("normRules",JSON.stringify(normRules))

        s.onload = function() {
            // this.remove();
        };
        (document.head || document.documentElement).appendChild(s); 
        
       
       
    }
})