


const addParsed=async(data)=>{
    let ruleResponses=localStorage.getItem('ruleResponses')?JSON.parse(localStorage.getItem('ruleResponses')):[]
    let already=ruleResponses.filter(item=>JSON.stringify(item.response)==JSON.stringify(data.response))
    if(!(already && already[0])){
        ruleResponses.push(data)
    }
    localStorage.setItem('ruleResponses', JSON.stringify(ruleResponses));
    // setTimeout(()=>{
        

    // },500)
}

const handleTabRules=(url,interceptedArr,limit,tabRuleObj,response)=>{
    return new Promise(async(resolve, reject) => {
        if(Object.keys(tabRuleObj)[0]){
            const {rules,objectId,name,webhook_destination}=tabRuleObj
            const allIntercepted=JSON.parse(localStorage.getItem('allIntercepted'))

            let match=false

            if(interceptedArr.length<limit){
                if(rules){
                    rules.forEach(async ruleObj=>{
                        if(new RegExp(ruleObj.request).test(url)){
                            match=true
                        } 
                    })
                }
                if(match){
                    if(response.text && typeof response.text === 'function'){
                        const text = await response.text();
                        const parsedResponse=JSON.parse(text);
                        let interceptObj={
                            objectId,name,url,webhook_destination,
                            response:parsedResponse,
                            timestamp :new Date().getTime()
                        }
                        if(interceptedArr.length<limit){

                            interceptedArr.push(interceptObj)
                            allIntercepted.push(interceptObj)
                            localStorage.setItem('interceptedArr',JSON.stringify(interceptedArr))
                            localStorage.setItem('allIntercepted',JSON.stringify(allIntercepted))

                            // let allIntercepted=JSON.parse(st.getItem('allIntercepted'))
                            // allIntercepted.push(interceptObj)
                            // st.setItem('allIntercepted',JSON.stringify(allIntercepted))
                            // console.log(allIntercepted);
                            
                        }else{
                            
                        }
                       
                    }
                    resolve(interceptedArr)
                }else{
                    resolve('NO MATCH')
                }
            }else{
                resolve('LIMIT REACHED')
            }
        }else{
            resolve('NO TAB RULES')
        }
        
        
    })
}

const handleRecipes=(url,jtoken,toBeMade,allMade)=>{
    return new Promise(async(resolve, reject) => {
     
        if(url.toLowerCase().includes('voyager')){
            console.log(toBeMade);
            let unMade=toBeMade.shift()
            console.log(unMade);
            localStorage.setItem('toBeMade',JSON.stringify(toBeMade))
            if(unMade){
                let URL=unMade.url
                var mlr = new XMLHttpRequest();
                mlr.onreadystatechange = function() {
                    if (mlr.readyState === XMLHttpRequest.DONE) {
                        console.log(mlr);
                       
                        let updatedObj={...unMade,response:mlr.responseText}
                        allMade.push(updatedObj)
                        console.log(allMade);
                        st.setItem('allMade',JSON.stringify(allMade))
                        
                                                resolve(allMade)
                    }
                }
                mlr.open('GET', URL, true);
                mlr.withCredentials = true
                mlr.setRequestHeader('csrf-token', jtoken);
                mlr.send();
            }
            
            
        }else{
            resolve('NOT VOYAGER')
        }
    })
}

(async function(xhr,win,st) {

    var XHR = XMLHttpRequest.prototype;
    let WIND=window;
   
    
   

    let salesDetails=JSON.parse(st.getItem('salesDetails'))
   
    let jtoken=st.getItem('jtoken')

    let tabRuleObj=JSON.parse(st.getItem('tabRuleObj'))
    

    const {rules,objectId,name,webhook_destination}=tabRuleObj
    const tabLimit=localStorage.getItem('tabLimit')

    let listenToSales=st.getItem('listenToSales')
    
    let newToBeMade=JSON.parse(st.getItem('newToBeMade'))
    let newToBeMadeChecked=false

    let normRules=JSON.parse(st.getItem('normRules'))
    
    
    

    var originalFetch = window.fetch
    var send = XHR.send;
    var open = XHR.open;

    WIND.fetch=function(callback){
        
        let url =typeof(callback)=='string'?callback:callback.url
        
        if(url && url.includes('chrome-extension://')){
            return
        }
        
        let match=false

        return originalFetch.apply(this, arguments);
    }
        XHR.open=async function (method,URL,oy) {
            
           return open.apply(this, arguments);  
        }

    XHR.send = async function(postData) {
        
        this.addEventListener('load', async function() {

            
            
            const {responseURL,responseType,response}=this
            let url=responseURL

            if(normRules[0] && Object.keys(normRules[0]).length>0){
                normRules.forEach(async obj => {
                    let regex=obj.target_request_url
                    
                    if(new RegExp(regex).test(responseURL)){
                        if(responseType=='blob'){
                            const {response}=this
                            if(response.text && typeof response.text === 'function'){
                                const text = await response.text();
                                const parsedResponse=JSON.parse(text);

                               
                                const finalResponse={
                                    ...obj,
                                    response:parsedResponse,
                                    url:this.responseURL,
                                    current_page:window.location.href,
                                    timestamp :new Date().getTime()
                                }
                                addParsed(finalResponse) 
                                
                            }
                        }
                    }
                    else{
                        // console.log(responseURL,'Does NOT MATCH');
                    }
                })
            }

            let prevInterceptArr=st.getItem('interceptedArr')?JSON.parse(st.getItem('interceptedArr')):null
            let ans=await handleTabRules(url,prevInterceptArr,parseInt(tabLimit),tabRuleObj,response)
            
            if(!newToBeMadeChecked){
                
                    if(url.toLowerCase().includes('voyager')){
                        newToBeMadeChecked=true
                        let fullReturned=[]
                        newToBeMade.forEach(obj=>{
                            let URL=obj.url
                            const {destination,label,objectId,profile}=obj
                            var mlr = new XMLHttpRequest();
                            mlr.onreadystatechange = function() {
                                if (mlr.readyState === XMLHttpRequest.DONE) {
                                    
                                    const toBeReturnedObj={
                                        url:URL,
                                        type:obj.type,
                                        response:mlr.responseText,
                                        destination,
                                        label,
                                        objectId,
                                        profile
                                    }
                                    let newToBeReturned=JSON.parse(localStorage.getItem('newToBeReturned'))
                                    newToBeReturned.push(toBeReturnedObj)
                                    localStorage.setItem("newToBeReturned",JSON.stringify(newToBeReturned))
                                 
                                }
                            };
                            mlr.open('GET', URL, true);
                            mlr.withCredentials = true
                            mlr.setRequestHeader('csrf-token', jtoken);
                            mlr.send();
                            // localStorage.setItem("urlsToBeMade",JSON.stringify(urlsToBeMade))
                        })
                        
    
                        
                        
                       
                        
                    }
            }
          
            if(listenToSales){
                const {objectId,destination,label}=salesDetails
                let interceptObj={}
                if(url.includes('sales-api/salesApiNewHiresAndSeniorNewHires')){
                    const text = await response.text();
                        const parsedResponse=JSON.parse(text);
                        let interceptedSales=JSON.parse(st.getItem('interceptedSales'))
                        interceptObj={
                            objectId,
                            response:parsedResponse,
                            url,
                            destination,
                            label,
                            type:'hires',
                            timestamp :new Date().getTime()
                        }
                        interceptedSales.push(interceptObj)
                        st.setItem('interceptedSales',JSON.stringify(interceptedSales))

                }else if(url.includes('sales-api/salesApiJobOpenings')){
                    const text = await response.text();
                        const parsedResponse=JSON.parse(text);
                        let interceptedSales=JSON.parse(st.getItem('interceptedSales'))
                        interceptObj={
                            objectId,
                            response:parsedResponse,
                            url,
                            type:'openings',
                            destination,
                            label,
                            timestamp :new Date().getTime()
                        }
                        interceptedSales.push(interceptObj)
                        st.setItem('interceptedSales',JSON.stringify(interceptedSales))
                    
                }else if(url.includes('sales-api/salesApiPersonas')){
                    const text = await response.text();
                        const parsedResponse=JSON.parse(text);
                        let interceptedSales=JSON.parse(st.getItem('interceptedSales'))
                        interceptObj={
                            objectId,
                            response:parsedResponse,
                            url,
                            type:'personas',
                            destination,
                            label,
                            timestamp :new Date().getTime()
                        }
                        interceptedSales.push(interceptObj)
                        st.setItem('interceptedSales',JSON.stringify(interceptedSales))
                    
                }else if(url.includes('sales-api/salesApiEmployeeInsights')){
                    const text = await response.text();
                        const parsedResponse=JSON.parse(text);
                        let interceptedSales=JSON.parse(st.getItem('interceptedSales'))
                        interceptObj={
                            objectId,
                            response:parsedResponse,
                            url,
                            type:'employees',
                            destination,
                            label,
                            timestamp :new Date().getTime()
                        }
                        interceptedSales.push(interceptObj)
                        st.setItem('interceptedSales',JSON.stringify(interceptedSales))
                    
                }else if(url.includes('sales-api/salesApiEntityAlerts')){
                    const text = await response.text();
                        const parsedResponse=JSON.parse(text);
                        let interceptedSales=JSON.parse(st.getItem('interceptedSales'))
                        interceptObj={
                            objectId,
                            response:parsedResponse,
                            type:'alerts',
                            url,
                            destination,
                            label,
                            timestamp :new Date().getTime()
                        }
                        interceptedSales.push(interceptObj)
                        st.setItem('interceptedSales',JSON.stringify(interceptedSales))
                    
                }
                // const salesIntercepted=st.getItem('salesIntercepted')?
                // JSON.parse('salesIntercepted'):[]

                // salesIntercepted.push(interceptObj
                // st.setItem('salesIntercepted',JSON.stringify(salesIntercepted))
            }
            
            if(false){
                    
                if(url.toLowerCase().includes('sales-api')){
                    let targetObj=salesUrlToBeMade.shift()
                    let URL=targetObj.url
                    const {destination,label,objectId}=targetObj
                    var mlr = new XMLHttpRequest();
                    mlr.onreadystatechange = function() {
                        if (mlr.readyState === XMLHttpRequest.DONE) {
                            console.log(mlr);
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
                    mlr.setRequestHeader('csrf-token', jtoken);
                    // SNHeaders.forEach(val=>{
                    //     try {
                    //         mlr.setRequestHeader(`${val.name}`, val.value); 
                    //     } catch (error) {
                    //         console.log('Could not add header',val.name);
                    //     }
                        
                        
                    // })
                    
                    mlr.send();
                    localStorage.setItem("salesUrlToBeMade",JSON.stringify(salesUrlToBeMade))
                }
            }
            
            

            
            
        })
        return send.apply(this, arguments);
    }
    

})(XMLHttpRequest,window,localStorage)