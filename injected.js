(async function(xhr,win,st) {

    var XHR = XMLHttpRequest.prototype;
    let WIND=window;

    
    
    let rules=JSON.parse(st.getItem('tabRules'))

    console.log(rules);

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
                console.log(url);
                console.log(response);
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
                    console.log(url);
                    console.log(parsedResponse);
                }
            }
            
        })

        return send.apply(this, arguments);
    }
    

})(XMLHttpRequest,window,localStorage)