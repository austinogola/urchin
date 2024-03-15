let urlsToBeMade=[]
let toBeMadeLen=0
const getProfileData=async(recipe)=>{
    const {settings,input,label,destination_webhook_url,type,objectId}=recipe
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
                        console.log(token);
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

const getSalesData=async(recipe)=>{
    const {settings,input,label,destination_webhook_url,type,objectId}=recipe
    const prefix='https://www.linkedin.com/'
    urlsToBeMade=[]
    salesChecker=false
    salesUrlToBeMade=[
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
            chrome.tabs.sendMessage(dets.tabId,{SNHeaders:requestHeaders})
            // requestHeaders.forEach(val=>{
            //     neededHeaders[val.name]=val.value
            // })
        }
    }
}
chrome.webRequest.onBeforeSendHeaders.addListener(setSalesHeaders
    ,{urls:["*://*.linkedin.com/*/*"]},["extraHeaders","requestHeaders"])


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
            if(url.includes('voyager/api') && toBeMadeLen>0 && !voyagerChecker){
                chrome.tabs.query({active:true},tabs=>{
                    let ourTab=tabs.filter(tt=>tt.id==tabId)
                    if(ourTab[0]){
                        voyagerChecker=true
                        chrome.tabs.sendMessage(tabId,{getVoyager:true,length:toBeMadeLen})
                        // sendMessageToTab(tabId,{getVoyager:true,length:toBeMadeLen})
                    }
                })
                

            }
        }
    }
}

chrome.webRequest.onCompleted.addListener(resultCheckers,
    {urls:["*://*.linkedin.com/*/*"]},["responseHeaders","extraHeaders"])



const fetchRecipes=()=>{
    return new Promise((resolve, reject) => {

        let recipeUrl=`https://eu-api.backendless.com/F1907ACC-D32B-5EA1-FFA2-16B5AC9AC700/E7D47F5F-7E77-4E8D-B6CE-E2E7A9C6C1C2/data/recipes?pageSize=${AUTOS_SIZE}&where=userID%3D'${userId}'`

        fetch(recipeUrl,{
            method:'GET'
        })
        .then(async res=>{
            let response=await res.json()
            resolve(response);

        })
    })
}

const runOneRecipe=(recipe)=>{
    const {type}=recipe
    if(type=='profile'){
        console.log('Fetching profile');
        getProfileData(recipe)
    }
    else if(type=='company'){
        console.log('Fetching company');
        getCompanyData(recipe)
        
    }
    else if(type=='sn_company'){
        console.log('Fetching SN');
        getSalesData(recipe)
        
    }
}

let recipesArr=[]
const startRecipes=async()=>{
    recipesArr=await fetchRecipes()
    if(Array.isArray(recipesArr)){
        let firstRecipe=recipesArr.shift()
        runOneRecipe(firstRecipe)
    }else{
        console.log('Recipe results',recipesArr);
    }
    
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
        })
        .catch(()=>{
            resolve(`Could not send recipe result to ${destination}`)
        })
        
    })
}