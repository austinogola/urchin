chrome.runtime.onMessage.addListener(async(request, sender, sendResponse)=>{
    if(request.tabIntercepted){
        const {tabIntercepted}=request
        sendRuleResult(tabIntercepted)
    }
})

const sendRuleResult=(resObj)=>{
    const {name,objectId,response,webhook_destination,timestamp,url}=resObj

    const body={response,url}

    let params={
        user:userId,
        task:taskId,
        name,
        objectId
    }

    let finalUrl=webhook_destination+'?'+new URLSearchParams(params)



    fetch(finalUrl,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(body)
    }).then(res=>{
        if(res.status==200){
            console.log('Successfully sent intercepted response');
        }else{
            console.log("Could not send intercepted response");
        }
        
    })
    .catch(err=>{
        console.log("Could not send intercepted response");
        // console.log(err.message);
    })
}


chrome.webRequest.onBeforeRequest.addListener((dets)=>{

    const {url}=dets
     
    if(dets.initiator){
        if(!(dets.initiator.includes('chrome-extension'))){
            const {rules}=tabRuleObj
            if(rules && rules[0]){
                let match=false
                rules.forEach(async ruleUrl=>{
                    if(new RegExp(ruleUrl).test(url)){
                        match=true
                    } 
                })
                if(match){
                    const {tabId}=dets
                    chrome.tabs.sendMessage(tabId,'check intercepted')
                }

            }
           
        }
        
    }
    
    
},{urls:["<all_urls>"]},["requestBody","extraHeaders"])


