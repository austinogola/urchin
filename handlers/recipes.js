let urlsToBeMade=[]
let toBeMadeLen=0
let RECIPE_SIZE;
let RECIPE_FREQ;
let RECIPES_ENABLED=false

chrome.storage.local.set({newToBeMade:[]})
const recipeChecker=(dets)=>{
    const {url,tabId}=dets
    if(dets.url==expectedUrl){
        try {
            chrome.tabs.sendMessage(tabId,{returnMade:true},function(response) {
                if (chrome.runtime.lastError) {
                    // console.log('Could not send');
                }
            })
            
        } catch (error) {
            // console.log(error.message);
        }
        
    }
}
let expectedUrl

const getAndSendCompany=(recipe)=>{
    const {settings,input,label,destination_webhook_url,type,objectId}=recipe
   
    return new Promise(async(resolve, reject) => {
        let mm=new CompanyObjs(recipe)
        let newToBeMade=[...mm.items]
        expectedUrl=newToBeMade[newToBeMade.length-1].url

        chrome.runtime.onMessage.addListener(async(request, sender, sendResponse)=>{
            if(request.recipeResult){
                chrome.webRequest.onCompleted.removeListener(recipeChecker)
                await sleep(7000)
                chrome.storage.local.set({newToBeMade:[]})
                chrome.tabs.remove(sender.tab.id)
                
                resolve(request.recipeResult)
            }
        })

        chrome.webRequest.onCompleted.addListener(recipeChecker,
            {urls:["*://*.linkedin.com/*/*"]},["responseHeaders","extraHeaders"])

        chrome.storage.local.set({newToBeMade:newToBeMade})
        setCsrfToken()

        // await unregisterAllDynamicScripts()
        // await chrome.scripting.registerContentScripts([{
        //     id: 'temporary',
        //     js: ["tabInject.js"],
        //     matches: ["<all_urls>"],
        //     runAt: "document_start"
        // }])
        let tabUrl=`https://www.linkedin.com/company/${input}/`
        let newTabObj=await openNewTab(tabUrl,true)
        
        
    })
}

const getAndSendSales=(recipe)=>{
    const {settings,input,label,destination_webhook_url,type,objectId}=recipe
   
    return new Promise(async(resolve, reject) => {
        let mm=new SalesObjs(recipe)
        let newToBeMade=[...mm.items]
        expectedUrl=newToBeMade[newToBeMade.length-1].url

        chrome.runtime.onMessage.addListener(async(request, sender, sendResponse)=>{
            if(request.recipeResult){
                await sleep(7000)
                chrome.tabs.remove(sender.tab.id)
                resolve(request.recipeResult)
            }
        })

        chrome.webRequest.onCompleted.addListener(recipeChecker,
            {urls:["*://*.linkedin.com/*/*"]},["responseHeaders","extraHeaders"])

        chrome.storage.local.set({newToBeMade:newToBeMade})
        setCsrfToken()

        await unregisterAllDynamicScripts()
        await chrome.scripting.registerContentScripts([{
            id: 'temporary',
            js: ["tabInject.js"],
            matches: ["<all_urls>"],
            runAt: "document_start"
        }])
        let tabUrl=`https://www.linkedin.com/sales/company/${input}/`
        let newTabObj=await openNewTab(tabUrl,true)
        
        
    })
}

const getAndSendProfile=(recipe)=>{
    const {settings,input,label,destination_webhook_url,type,objectId}=recipe
    return new Promise(async(resolve, reject) => {
        let mm=new ProfileObjs(recipe)
        let newToBeMade=[...mm.items]
        expectedUrl=newToBeMade[newToBeMade.length-1].url

        chrome.runtime.onMessage.addListener(async(request, sender, sendResponse)=>{
            if(request.recipeResult){
                chrome.webRequest.onCompleted.removeListener(recipeChecker)
                await sleep(7000)
                chrome.tabs.remove(sender.tab.id)
                chrome.storage.local.set({newToBeMade:[]})
                // updateRecipe(objectId)
                resolve(request.recipeResult)
            }
        })

        chrome.webRequest.onCompleted.addListener(recipeChecker,
            {urls:["*://*.linkedin.com/*/*"]},["responseHeaders","extraHeaders"])

        chrome.storage.local.set({newToBeMade:newToBeMade})
        setCsrfToken()
        await unregisterAllDynamicScripts()
        await chrome.scripting.registerContentScripts([{
            id: 'temporary',
            js: ["tabInject.js"],
            matches: ["<all_urls>"],
            runAt: "document_start"
        }])
        let tabUrl=`https://www.linkedin.com/in/${input}/`
        let newTabObj=await openNewTab(tabUrl,true)
    
        
        return
        
        
    })
}
const SalesObjs = class {
    constructor(recp) {
        const {settings,input,label,destination_webhook_url,type,objectId}=recp
        this.items=[
            {
                label,
                destination:destination_webhook_url,
                objectId,
                type:'hires',
                url:`https://www.linkedin.com/sales-api/salesApiNewHiresAndSeniorNewHires/${input}`,
    
            },
            {
                label,
                destination:destination_webhook_url,
                objectId,
                type:'openings',
                url:`https://www.linkedin.com/sales-api/salesApiJobOpenings/${input}`,
    
            },
            {
                label,
                destination:destination_webhook_url,
                objectId,
                type:'personas',
                url:`https://www.linkedin.com/sales-api/salesApiPersonas?q=seat&targetCompanyId=${input}&decorationId=com.linkedin.sales.deco.desktop.common.Persona-1`,
    
            },
            {
                label,
                destination:destination_webhook_url,
                objectId,
                type:'headcount',
                url:`https://www.linkedin.com/sales-api/salesApiEmployeeInsights/${input}?employeeInsightType=FUNCTIONAL_HEADCOUNT`,
    
            },
            {
                label,
                destination:destination_webhook_url,
                objectId,
                type:'alerts',
                url:`https://www.linkedin.com/sales-api/salesApiEntityAlerts?`+new URLSearchParams({
                    q: 'criteria',
                    entityUrn: "urn:li:fs_salesCompany:"+input,
                    sortBy: "TIME",buyerAlertsIndex: 0,start: 0,count: 20
                }),
    
            },
        ]
      
      
    }
}
const CompanyObjs = class {
    constructor(recp) {
        const {settings,input,label,destination_webhook_url,type,objectId}=recp
      this.items = [
        {
            type:'main',
            url:`https://www.linkedin.com/voyager/api/organization/companies?`+new URLSearchParams({
                decorationId: "com.linkedin.voyager.deco.organization.web.WebFullCompanyMain-35",
                q: "universalName",
                universalName: input,
            }),
            response:null,
            profile:input,
            label,
            destination:destination_webhook_url,
            objectId
        },
        {
            response:null,
            profile:input,
            label,
            destination:destination_webhook_url,
            objectId,
            type:'updates',
            url:`https://www.linkedin.com/voyager/api/feed/updates?`+new URLSearchParams({ 
                companyUniversalName: input,
            q: "companyFeedByUniversalName",
            moduleKey: "member-share",
            count: 20,
            start: 0,
        })    
    }
       
      ]
      
    }
}



const ProfileObjs = class {
    constructor(rcp) {
        const {settings,input,label,destination_webhook_url,type,objectId}=rcp
      this.items = [
        {
            type:'main',
            url:`https://www.linkedin.com/voyager/api/identity/profiles/${input}/profileView`,
            response:null,
            profile:input,
            label,
            destination:destination_webhook_url,
            objectId
        },
        {
            type:'contacts',
            url:`https://www.linkedin.com/voyager/api/identity/profiles/${input}/profileContactInfo`,
            response:null,
            profile:input,
            label,
            destination:destination_webhook_url,
            objectId
            
        },
        // {
        //     type:'positions',
        //     url:`https://www.linkedin.com/voyager/api/identity/profiles/${input}/positionGroups`,
        //     response:null,
        //     profile:input,
            // label,
            //     destination:destination_webhook_url,
            //     objectId

        // },
        // {
        //     type:'skills',
        //     url:`https://www.linkedin.com/voyager/api/identity/profiles/${input}/skills`,
        //     response:null,
        //     profile:input,
        // label,
        //     destination:destination_webhook_url,
        //     objectId

        // },
        {
            type:'network',
            url:`https://www.linkedin.com/voyager/api/identity/profiles/${input}/networkinfo`,
            response:null,
            profile:input,
            label,
            destination:destination_webhook_url,
            objectId

        },
        {
            type:'badges',
            url:`https://www.linkedin.com/voyager/api/identity/profiles/${input}/memberBadges`,
            response:null,
            profile:input,
            label,
            destination:destination_webhook_url,
            objectId

        },
        // {
        //     type:'privacy',
        //     url:`https://www.linkedin.com/voyager/api/identity/profiles/${input}/privacySettings`,
        //     response:null,
        //     profile:input

        // },
        {
            type:'updates',
            url:`https://www.linkedin.com/voyager/api/feed/updates?`+new URLSearchParams({ "profileId": input,
            "q": "memberShareFeed",
            "moduleKey": "member-share",
            "count": 20,
            "start": 0}),
            response:null,
            profile:input,
            label,
            destination:destination_webhook_url,
            objectId
        
         }
      ]
      
    }
}
const getProfileData=async(recipe)=>{
    const {settings,input,label,destination_webhook_url,type,objectId}=recipe
    chrome.storage.local.set({listenToSales:false})
    const prefix='https://www.linkedin.com/'
    salesUrlToBeMade=[]
    voyagerChecker=false
    urlsToBeMade=[
        {
            type:'main',
            url:`https://www.linkedin.com/voyager/api/identity/profiles/${input}/profileView`,
            label,
            destination:destination_webhook_url,
            objectId

        },
        {
            label,
            destination:destination_webhook_url,
            objectId,
            type:'contacts',
            url:`https://www.linkedin.com/voyager/api/identity/profiles/${input}/profileContactInfo`,

        },
        {
            label,
            destination:destination_webhook_url,
            objectId,
            type:'positions',
            url:`https://www.linkedin.com/voyager/api/identity/profiles/${input}/positionGroups`,

        },
        {
            label,
            destination:destination_webhook_url,
            objectId,
            type:'skills',
            url:`https://www.linkedin.com/voyager/api/identity/profiles/${input}/skills`,

        },
        {
            label,
            destination:destination_webhook_url,
            objectId,
            type:'network',
            url:`https://www.linkedin.com/voyager/api/identity/profiles/${input}/networkinfo`,

        },
        {
            label,
            destination:destination_webhook_url,
            objectId,
            type:'badges',
            url:`https://www.linkedin.com/voyager/api/identity/profiles/${input}/memberBadges`,

        },
        {
            label,
            destination:destination_webhook_url,
            objectId,
            type:'privacy',
            url:`https://www.linkedin.com/voyager/api/identity/profiles/${input}/privacySettings`,

        },
        {
            label,
            destination:destination_webhook_url,
            objectId,
            type:'badges',
            url:`https://www.linkedin.com/voyager/api/identity/profiles/${input}/memberBadges`,

        },
        
        {
            label,
            destination:destination_webhook_url,
            objectId,
            type:'updates',
            url:`https://www.linkedin.com/voyager/api/feed/updates?`+new URLSearchParams({ "profileId": input,
            "q": "memberShareFeed",
            "moduleKey": "member-share",
            "count": 100,
            "start": 0,
        }),

        },
    ]
    salesToBeMadeLen=salesUrlToBeMade.length
    toBeMadeLen=urlsToBeMade.length
    setCsrfToken()
    chrome.storage.local.set({urlsToBeMade})
    chrome.storage.local.set({salesUrlToBeMade})
    await chrome.scripting.registerContentScripts([{
        id: input+'tab',
        js: ["tabInject.js"],
        matches: ["<all_urls>"],
        runAt: "document_start"
    }])
    let homeUrl=`https://www.linkedin.com/in/${input}/`
    let newTabObj=await openNewTab(homeUrl,true,true)
}
const setCsrfToken=()=> {
    return new Promise((resolve, reject) => {
        let token
        let checkInterval=setInterval(() => {
            if(!token){
                chrome.cookies.get({url: "https://www.linkedin.com",name: "JSESSIONID"},
                (cks)=>{
                    if(cks){
                        let val=cks.value
                        token=val.replace(/"/g, "")
                        chrome.storage.local.set({jtoken:token})
                    }
                    
    
                });
            }else{
                clearInterval(checkInterval)
            }
           
        }, 500);
      
    });
}


const getCompanyData=async(recipe)=>{
    const {settings,input,label,destination_webhook_url,type,objectId}=recipe
    // console.log(settings);
    chrome.storage.local.set({listenToSales:false})
    const prefix='https://www.linkedin.com/'
    salesUrlToBeMade=[]
    voyagerChecker=false
    urlsToBeMade=[
        {
            label,
            destination:destination_webhook_url,
            objectId,
            type:'main',
            url:`https://www.linkedin.com/voyager/api/organization/companies?`+new URLSearchParams({
                decorationId: "com.linkedin.voyager.deco.organization.web.WebFullCompanyMain-35",
                q: "universalName",
                universalName: input,
            }),

        },
        {
            label,
            destination:destination_webhook_url,
            objectId,
            type:'updates',
            url:`https://www.linkedin.com/voyager/api/feed/updates?`+new URLSearchParams({ companyUniversalName: input,
            q: "companyFeedByUniversalName",
            moduleKey: "member-share",
            count: 20,
            start: 0,
        }),

        },
    ]
    salesToBeMadeLen=salesUrlToBeMade.length
    toBeMadeLen=urlsToBeMade.length
    setCsrfToken()
    chrome.storage.local.set({urlsToBeMade})
    chrome.storage.local.set({salesUrlToBeMade})
    await chrome.scripting.registerContentScripts([{
        id: input+'tab',
        js: ["tabInject.js"],
        matches: ["<all_urls>"],
        runAt: "document_start"
    }])
    let companyHomeUrl=`https://www.linkedin.com/company/${input}/`
    let newTabObj=await openNewTab(companyHomeUrl,true,true)
}
let salesUrlToBeMade=[]
let salesToBeMadeLen=0

chrome.storage.local.set({listenToSales:false})
const getSalesData2=async(recipe)=>{
    return new Promise(async(resolve, reject) => {
        const {settings,input,label,destination_webhook_url,type,objectId}=recipe
        chrome.runtime.onMessage.addListener(async(request, sender, sendResponse)=>{
            if(request.newSalesRecipe){
                await sleep(7000)
                chrome.tabs.remove(sender.tab.id)
                chrome.storage.local.set({newToBeMade:[]})
                chrome.storage.local.set({interceptedSales:[]})
                chrome.storage.local.set({listenToSales:false})
                chrome.storage.local.set({salesDetails:{}})
                // updateRecipe(objectId)
                resolve(request.newSalesRecipe)
            }
        })
        chrome.storage.local.set({interceptedSales:[]})
        chrome.storage.local.set({listenToSales:true})
        chrome.storage.local.set({salesDetails:{
           label,
           destination:destination_webhook_url,
           objectId
            
         }})
         let salesHomeUrl=`https://www.linkedin.com/sales/company/${input}`
        let newTabObj=await openNewTab(salesHomeUrl,true,true)
        await sleep(5000)
        chrome.tabs.sendMessage(newTabObj.tabId,'start sales')
    })
    
    

    

}

const getSalesData=async(recipe)=>{
    const {settings,input,label,destination_webhook_url,type,objectId}=recipe
    
    const prefix='https://www.linkedin.com/'
    urlsToBeMade=[]
    salesChecker=false
    
    salesToBeMadeLen=salesUrlToBeMade.length
    toBeMadeLen=urlsToBeMade.length
    setCsrfToken()
    chrome.storage.local.set({urlsToBeMade})
    chrome.storage.local.set({salesUrlToBeMade})
    await chrome.scripting.registerContentScripts([{
        id: input+'tab',
        js: ["tabInject.js"],
        matches: ["<all_urls>"],
        runAt: "document_start"
    }])
    let salesHomeUrl=`https://www.linkedin.com/sales/company/${input}`
    let newTabObj=await openNewTab(salesHomeUrl,true,true)
}
const practiceProfile=async(profileId)=>{
    await sleep(2000)
    // let profs=getProfileData(profileId)
    // let profs=getCompanyData(profileId)

}



// practiceProfile('rob-simpson-96a36823')
// practiceProfile('safaricom')
let setSalesHeaders=(dets)=>{
    if(dets.initiator && !dets.initiator.includes('chrome')){
        if(dets.url.includes('sales-api')){
            let {requestHeaders}=dets
            // chrome.storage.local.set({SNHeaders:requestHeaders})
            // chrome.tabs.sendMessage(dets.tabId,{SNHeaders:requestHeaders})
            // requestHeaders.forEach(val=>{
            //     neededHeaders[val.name]=val.value
            // })
        }
    }
}



let salesChecker=false
let voyagerChecker=false

const resultCheckers=async(dets)=>{
    if(dets.initiator){
        if(!(dets.initiator.includes('chrome-extension'))){
            const {url,tabId}=dets
            if(url.includes('sales-api') && salesToBeMadeLen>0 && !salesChecker){
                chrome.tabs.query({active:true},tabs=>{
                    let ourTab=tabs.filter(tt=>tt.id==tabId)
                    if(ourTab[0]){
                        salesChecker=true
                        chrome.tabs.sendMessage(tabId,{getSales:true,length:salesToBeMadeLen})
                        // sendMessageToTab(tabId,{getSales:true,length:salesToBeMadeLen})
                    }
                })
                
                
            }
            
        }
    }
}







const fetchRecipes=(test)=>{
    return new Promise((resolve, reject) => {
       
        const recipeParams=new URLSearchParams({
            pageSize:test?5:RECIPE_SIZE,
            where:test?`userID='${userId}'`:
            `userID='${userId}' AND complete=false`,
            user:userId,
            type:'recipes',
            request:'GET',
            
    
        })
        
        fetch(backendHost+'?'+recipeParams,{
            method:'POST',
            headers:{"Content-Type":'application/json'},
            body:JSON.stringify({complete:false})
        })
        .then(async res=>{
            let response=await res.json()
            resolve(response);

        })
    })
}

const updateRecipe=async(id)=>{
    let ob={
        complete:true
    }
    // let updateUrl=`https://eu-api.backendless.com/F1907ACC-D32B-5EA1-FFA2-16B5AC9AC700/E7D47F5F-7E77-4E8D-B6CE-E2E7A9C6C1C2/data/tabs/${id}`
    const updateTabParams=new URLSearchParams({
        pageSize:AUTOS_SIZE,
        where:`userID='${userId}' AND complete=false`,
        user:'rob1',
        type:'recipes',
        request:'PUT',
        id:id
        

    })
    fetch(backendHost+'?'+updateTabParams,{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify(ob)
    })
    

}
// fetchRecipes()
const runOneRecipe=async(recipe)=>{
    return new Promise(async(resolve, reject) => {
        const {type}=recipe

        let ans

        if(type){
            if(type=='profile'){
                recipesRunning=true
                console.log('Fetching profile');
                ans=await getAndSendProfile(recipe)
                
            }
            else if(type=='company'){
                recipesRunning=true
                console.log('Fetching company');
                ans=await getAndSendCompany(recipe)
                
            }
            else if(type=='sn_company'){
                recipesRunning=true
                console.log('Fetching SN');
               ans=await getSalesData2(recipe)
               sendSalesRecipe(ans).then(sendingResult=>{
                console.log(sendingResult);
                })
                resolve(ans)
                return
                // ans=await getAndSendSales(recipe)
                
            }
            if(ans && ans[0]){
                sendRecipes(ans).then(sendingResult=>{
                    console.log(sendingResult);
                })
            }

        }else{
            resolve('NO TYPE')  
        }

        
        
        recipesRunning=false
        
        resolve(ans)
    })
    
    

}
chrome.storage.local.set({salesDetails:{}})
let recipesArr=[]
let recipesRunning=false
const startRecipes=async()=>{
    console.log('Checking recipes');
        // recipesArr=recipesArr.filter(item=>item.type=='profile') 
    chrome.storage.local.set({normRules:[]})
   
    if(RECIPES_ENABLED && !recipesRunning && !tabsRunning){
        recipesArr=await fetchRecipes()
        console.log(recipesArr);
        // recipesArr=recipesArr.filter(item=>item.type=='sn_company')
        if(Array.isArray(recipesArr)){
            for (let i = 0; i < recipesArr.length; i++) {
                const rcp = recipesArr[i];
                let ans=await runOneRecipe(rcp)
                await sleep(4000)
                
            }
           
        }else{
            console.log('Recipe results',recipesArr);
        }
    }
    chrome.storage.local.set({normRules:normRules})
    
    
}

let recipeInt
const setRecipes=()=>{
    return new Promise(async(resolve, reject) => {
        // clearInterval(recipeInt)

        // recipeInt=setInterval(startRecipes,RECIPE_FREQ*60*1000)
        chrome.alarms.create(`startRecipes`,{
            delayInMinutes:RECIPE_FREQ,
            periodInMinutes:RECIPE_FREQ
        }) 
    })
}
const sendSalesRecipe=(rr)=>{
    return new Promise((resolve, reject) => {
        const {destination,label,objectId,response,type}=rr
        const body={result:response}
        let message=''
        const params=new URLSearchParams({
            label,
            objectId
        })
        fetch(destination+'?'+params,{
            method:'POST',
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify(body)
        })
        .then((res)=>{
            
            if(res.status==200){
                message='Recipe result sent'
            }else{
                message=`Could not send recipe result to ${destination}`
            }
            resolve(message)
            updateRecipe(objectId)
        })
        .catch(()=>{
            resolve(`Could not send recipe result to ${destination}`)
        })
    })
}
const sendRecipes=(recipeResultArr)=>{
    return new Promise((resolve, reject) => {
        let {destination,label,objectId}=recipeResultArr[0]
        let result={}
        for (let i = 0; i < recipeResultArr.length; i++) {
            const {response,type} = recipeResultArr[i];
            let parsed=JSON.parse(response)
            result[type]=response
            
        }
        const body={result}
        const params=new URLSearchParams({
            label,
            objectId
        })
        fetch(destination+'?'+params,{
            method:'POST',
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify(body)
        })
        .then((res)=>{
            let message=''
            if(res.status==200){
                message='Recipe result sent'
            }else{
                message=`Could not send recipe result to ${destination}`
            }
            resolve(message)
            updateRecipe(objectId)
        })
        .catch(()=>{
            resolve(`Could not send recipe result to ${destination}`)
        })
        
    })
}