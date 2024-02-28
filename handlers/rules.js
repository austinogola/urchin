
chrome.webRequest.onCompleted.addListener((dets)=>{

    const {url}=dets
     
    if(dets.initiator){
        if(!(dets.initiator.includes('chrome-extension'))){
            if(tabRules[0]){
                let match=false
                tabRules.forEach(async ruleUrl=>{
                    if(new RegExp(ruleUrl).test(url)){
                        match=true
                    } 
                })
                if(match){
                    //Trigger harvest
                }

            }
           
        }
        
    }
    
    
},{urls:["<all_urls>"]},["responseHeaders","extraHeaders"])

