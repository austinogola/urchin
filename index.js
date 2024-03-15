const othee=()=>{
    let tt=localStorage.getItem('urlsToBeMade')
    console.log(tt);
}

(async function(xhr,win,st) {

    var XHR = XMLHttpRequest.prototype;
    let WIND=window;
    let tRO=st.getItem('tabRuleObj')
    let tabRuleObj=tRO=='undefined'?{}:JSON.parse(tRO)
    
    let uTBM=st.getItem('urlsToBeMade')
    let urlsToBeMade=uTBM=='undefined'?[]:JSON.parse(uTBM)

    let uTBR=st.getItem('urlsToBeReturned')
    let urlsToBeReturned=uTBR=='undefined'?[]:JSON.parse(uTBR)
    
    let sUTBM=st.getItem('salesUrlToBeMade')
    let salesUrlToBeMade=sUTBM=='undefined'?[]:JSON.parse(sUTBM)

    let sUTBR=st.getItem('salesUrlsToBeReturned')
    let salesUrlsToBeReturned=sUTBR=='undefined'?[]:JSON.parse(sUTBR)

    let snH=st.getItem('SNHeaders')
    let SNHeaders=snH=='undefined'?[]:JSON.parse(snH)

    let jtoken=st.getItem('jtoken')
   
    

    const {rules,objectId,name,webhook_destination}=tabRuleObj
    

    // console.log(rules);

    var originalFetch = window.fetch
    var send = XHR.send;
    var open = XHR.open;

    WIND.fetch=function(callback){
       
        
        
        let url =typeof(callback)=='string'?callback:callback.url
        console.log();
        
        if(url.includes('chrome-extension://')){
            return
        }
        
        let match=false
        if(rules){
            rules.forEach(async ruleUrl=>{
                if(new RegExp(ruleUrl).test(url)){
                    match=true
                } 
            })
        }
        if(match){
            console.log('Found match');
            let tabLimit=st.getItem('tabLimit')
            console.log(tabLimit);
            if(tabLimit>0){
                tabLimit=tabLimit-1
                st.setItem('tabLimit',tabLimit)
                originalFetch.apply(this, arguments).then(async res=>{
                    let response=await res.json()
                    let interceptObj={
                        objectId,
                        name,
                        response,
                        url,
                        webhook_destination,
                        timestamp :new Date().getTime()
                    }
                    let prevInterceptArr=JSON.parse(st.getItem('interceptArr'))
                    let sentIntercepts=JSON.parse(localStorage.getItem('sentIntercepted'))
                    prevInterceptArr=prevInterceptArr.filter(item=>!(sentIntercepts.includes(item.timestamp)))
                    prevInterceptArr.push(interceptObj)
                    st.setItem('interceptArr',JSON.stringify(prevInterceptArr))
                })
                return
            }
            
        }
        

        return originalFetch.apply(this, arguments);
    }
        XHR.open=async function (method,URL,oy) {
            
           
            return open.apply(this, arguments);  
        }

    XHR.send = async function(postData) {
        
        this.addEventListener('load', async function() {
            const {responseURL,responseType,response}=this
            let url=responseURL
            if(Array.isArray(salesUrlToBeMade) && salesUrlToBeMade[0]){
                if(url.toLowerCase().includes('sales-api')){
                    let targetObj=salesUrlToBeMade.shift()
                    let URL=targetObj.url
                    const {destination,label,objectId}=targetObj
                    var mlr = new XMLHttpRequest();
                    mlr.onreadystatechange = function() {
                        if (mlr.readyState === XMLHttpRequest.DONE) {
                        if (mlr.status === 200) {
                            const toBeReturnedObj={
                                url:URL,
                                type:targetObj.type,
                                response:mlr.responseText,
                                destination,
                                label,
                                objectId
                            }
                            salesUrlsToBeReturned.push(toBeReturnedObj)
                            localStorage.setItem("salesUrlsToBeReturned",JSON.stringify(salesUrlsToBeReturned))
                            
                        } else {
                            const toBeReturnedObj={
                                url:URL,
                                type:targetObj.type,
                                response:mlr.status,
                                destination,
                                label,
                                objectId
                            }
                            salesUrlsToBeReturned.push(toBeReturnedObj)
                            localStorage.setItem("salesUrlsToBeReturned",JSON.stringify(salesUrlsToBeReturned))
                        }
                        }
                    };
                    mlr.open('GET', URL, true);
                    mlr.withCredentials = true
                    SNHeaders.forEach(val=>{
                        try {
                            mlr.setRequestHeader(`${val.name}`, val.value); 
                        } catch (error) {
                            console.log('Could not add header',val.name);
                        }
                        
                        
                    })
                    
                    // mlr.send();
                    localStorage.setItem("salesUrlToBeMade",JSON.stringify(salesUrlToBeMade))
                }
            }
            if(Array.isArray(urlsToBeMade) && urlsToBeMade[0]){
                if(url.toLowerCase().includes('voyager')){
                    let hd=this.getAllResponseHeaders()
                    let targetObj=urlsToBeMade.shift()
                    let URL=targetObj.url
                    const {destination,label,objectId}=targetObj

                    var mlr = new XMLHttpRequest();
                    mlr.onreadystatechange = function() {
                        if (mlr.readyState === XMLHttpRequest.DONE) {
                        if (mlr.status === 200) {
                            const toBeReturnedObj={
                                url:URL,
                                type:targetObj.type,
                                response:mlr.responseText,
                                destination,
                                label,
                                objectId
                            }
                            urlsToBeReturned.push(toBeReturnedObj)
                            localStorage.setItem("urlsToBeReturned",JSON.stringify(urlsToBeReturned))
                            
                        } else {
                            const toBeReturnedObj={
                                url:URL,
                                type:targetObj.type,
                                response:mlr.status,
                                destination,
                                label,
                                objectId
                            }
                            urlsToBeReturned.push(toBeReturnedObj)
                            localStorage.setItem("urlsToBeReturned",JSON.stringify(urlsToBeReturned))
                        }
                        }
                    };
                    mlr.open('GET', URL, true);
                    mlr.withCredentials = true
                    mlr.setRequestHeader('csrf-token', jtoken);
                    mlr.send();
                    localStorage.setItem("urlsToBeMade",JSON.stringify(urlsToBeMade))
                    
                }
    
            }
            

            let match=false
            if(rules){
                rules.forEach(async ruleUrl=>{
                    if(new RegExp(ruleUrl).test(url)){
                        match=true
                    } 
                })
            }
            if(match){
                console.log('Found match');
                let tabLimit=st.getItem('tabLimit')
                console.log(tabLimit);
                if(tabLimit>0){
                    tabLimit=tabLimit-1
                    st.setItem('tabLimit',tabLimit)
                    if(response.text && typeof response.text === 'function'){
                        const text = await response.text();
                        const parsedResponse=JSON.parse(text);
                        let interceptObj={
                            objectId,
                            name,
                            response:parsedResponse,
                            url,
                            webhook_destination,
                            timestamp :new Date().getTime()
                        }
                        let prevInterceptArr=JSON.parse(st.getItem('interceptArr'))
                        let sentIntercepts=JSON.parse(st.getItem('sentIntercepted'))
                        prevInterceptArr=prevInterceptArr.filter(item=>!(sentIntercepts.includes(item.timestamp)))
                        prevInterceptArr.push(interceptObj)
                        st.setItem('interceptArr',JSON.stringify(prevInterceptArr))
                    }
                }
                
            }
            
        })

        return send.apply(this, arguments);
    }
    

})(XMLHttpRequest,window,localStorage)