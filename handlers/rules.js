chrome.runtime.onMessage.addListener(async(request, sender, sendResponse)=>{
    if(request.tabIntercepted){
        const {tabIntercepted}=request
        sendRuleResult(tabIntercepted)
    }
    if(request.interceptedArray){
        const {interceptedArray}=request
        if(interceptedArray[0]){
            interceptedArray.forEach(obj => {
                sendRuleResult(obj)
                
            });
        }
    }
})

let alReadySent=[]
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

// chrome.webRequest.onErrorOccurred.addListener((dets)=>{
//     console.log(dets);
// },{urls:["<all_urls>"]},["extraHeaders"])

const tabMatch=(dets)=>{
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
                    console.log('found match')
                    chrome.tabs.sendMessage(tabId,{checkIntercepted:true,url})
                }

            }
           
        }
        
    }
}
let normRules=[]
const setNormalRules=async()=>{
    normRules=await getRules()
    if(Array.isArray(normRules)){
        console.log(normRules);
        chrome.storage.local.set({normRules:normRules})
    }else{
        console.log(normRules);
    }
}


chrome.webRequest.onCompleted.addListener((dets)=>{
    const {url,tabId}=dets
    chrome.storage.local.get(['normRules'],res=>{
        const {normRules}=res
        if(normRules[0]){
            normRules.forEach(obj=>{
                let regex=obj.target_request
                if(new RegExp(regex).test(url) ){
                    chrome.tabs.sendMessage(tabId,{checkRuleResponse:true})
                }
            })
        }
    })
},
    {urls:["*://*.linkedin.com/*/*"]},["responseHeaders","extraHeaders"])

const getRules=()=>{
    return new Promise(async(resolve, reject) => {
        const rulesParams=new URLSearchParams({
            pageSize:100,
            where:`userID='${userId}' AND rule_status=true`,
            user:userId,
            type:'rules',
            request:'GET',
    
        })
        fetch(backendHost+'?'+rulesParams,{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            }
        })
        .then(async res=>{
            let response=await res.json()
            resolve(response)
        })
        
    })
}

const sendInterceptedRules=(responseArray)=>{
    // console.log(hasDuplicateObjects(responseArray));
    // console.log(allRuleProps,responseArray);
    responseArray.forEach(ruleObj=>{
      
        
    const {destination_webhook_url,response,rule_label,
        target_page_url,target_request_url,current_page} = ruleObj
        

    let params={
        user:userId,
        task:taskId,
        rule_label,
        target_page:target_page_url,
        target_request:target_request_url,
        current_page
    }
    // const {auto_name,auto_id}=figureResponseAuto(ruleObj)
    // params['auto_name']=auto_name
    // params['auto_id']=auto_id
    
    // if(running_action){
    //     params['action_name']=running_action

    // }

    // console.log('Sending',response , 'to webhook');

    // console.log('Sending intercepted',response)

    fetch(destination_webhook_url+'?'+new URLSearchParams(params),{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(response)
    }).then(res=>{
        console.log("sent body to",destination_webhook_url);
    })
    .catch(err=>{
        console.log("Couldn't send body to",destination_webhook_url);
        console.log(err.message);
    })
    })
    
}



