(async function(xhr,win,st) {

    var XHR = XMLHttpRequest.prototype;
    let WIND=window;

    
    
    let tabRuleObj=JSON.parse(st.getItem('tabRuleObj'))

    const {rules,objectId,name,webhook_destination}=tabRuleObj

    // console.log(rules);

    var originalFetch = window.fetch
    var send = XHR.send;

    WIND.fetch=function(callback){
        
        let url =typeof(callback)=='string'?callback:callback.url
        
        if(url.includes('chrome-extension://')){
            return
        }
       
        let match=false
        rules.forEach(async ruleUrl=>{
            if(new RegExp(ruleUrl).test(url)){
                match=true
            } 
        })

        if(match){
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
                console.log(prevInterceptArr);
                st.setItem('interceptArr',JSON.stringify(prevInterceptArr))
            })
            return
        }
        

        return originalFetch.apply(this, arguments);
    }

    XHR.send = function(postData) {
        this.addEventListener('load', async function() {
            const {responseURL,responseType,response}=this
            let url=responseURL

            let match=false
            rules.forEach(async ruleUrl=>{
                if(new RegExp(ruleUrl).test(url)){
                    match=true
                } 
            })
            if(match){
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
            
        })

        return send.apply(this, arguments);
    }
    

})(XMLHttpRequest,window,localStorage)