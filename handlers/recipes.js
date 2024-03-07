let urlsToBeMade=[]
let toBeMadeLen=0
const getProfileData=async(profileId)=>{
    const prefix='https://www.linkedin.com/'
    salesUrlToBeMade=[]
    urlsToBeMade=[
        {
            type:'main',
            url:`https://www.linkedin.com/voyager/api/identity/profiles/${profileId}/profileView`,

        },
        {
            type:'contacts',
            url:`https://www.linkedin.com/voyager/api/identity/profiles/${profileId}/profileContactInfo`,

        },
        {
            type:'positions',
            url:`https://www.linkedin.com/voyager/api/identity/profiles/${profileId}/positionGroups`,

        },
        {
            type:'skills',
            url:`https://www.linkedin.com/voyager/api/identity/profiles/${profileId}/skills`,

        },
        {
            type:'network',
            url:`https://www.linkedin.com/voyager/api/identity/profiles/${profileId}/networkinfo`,

        },
        {
            type:'badges',
            url:`https://www.linkedin.com/voyager/api/identity/profiles/${profileId}/memberBadges`,

        },
        {
            type:'privacy',
            url:`https://www.linkedin.com/voyager/api/identity/profiles/${profileId}/privacySettings`,

        },
        {
            type:'badges',
            url:`https://www.linkedin.com/voyager/api/identity/profiles/${profileId}/memberBadges`,

        },
        
        {
            type:'updates',
            url:`https://www.linkedin.com/voyager/api/feed/updates?`+new URLSearchParams({ "profileId": profileId,
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
        id: profileId+'tab',
        js: ["tabInject.js"],
        matches: ["<all_urls>"],
        runAt: "document_start"
    }])
    let homeUrl=`https://www.linkedin.com/in/${profileId}/`
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


const getCompanyData=async(companyId)=>{
    const prefix='https://www.linkedin.com/'
    salesUrlToBeMade=[]
    urlsToBeMade=[
        {
            type:'main',
            url:`https://www.linkedin.com/voyager/api/organization/companies?`+new URLSearchParams({
                decorationId: "com.linkedin.voyager.deco.organization.web.WebFullCompanyMain-35",
                q: "universalName",
                universalName: companyId,
            }),

        },
        {
            type:'updates',
            url:`https://www.linkedin.com/voyager/api/feed/updates?`+new URLSearchParams({ companyUniversalName: companyId,
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
        id: companyId+'tab',
        js: ["tabInject.js"],
        matches: ["<all_urls>"],
        runAt: "document_start"
    }])
    let companyHomeUrl=`https://www.linkedin.com/company/${companyId}/`
    let newTabObj=await openNewTab(companyHomeUrl,true,true)
}
let salesUrlToBeMade=[]
let salesToBeMadeLen=0
const getSalesData=async(companyId)=>{
    const prefix='https://www.linkedin.com/'
    urlsToBeMade=[]
    salesUrlToBeMade=[
        {
            type:'hires',
            url:`https://www.linkedin.com/sales-api/salesApiNewHiresAndSeniorNewHires/${companyId}`,

        },
        {
            type:'openings',
            url:`https://www.linkedin.com/sales-api/salesApiJobOpenings/${companyId}`,

        },
        {
            type:'personas',
            url:`https://www.linkedin.com/sales-api/salesApiPersonas?q=seat&targetCompanyId=${companyId}&decorationId=com.linkedin.sales.deco.desktop.common.Persona-1`,

        },
        {
            type:'headcount',
            url:`https://www.linkedin.com/sales-api/salesApiEmployeeInsights/${companyId}?employeeInsightType=FUNCTIONAL_HEADCOUNT`,

        },
        {
            type:'alerts',
            url:`https://www.linkedin.com/sales-api/salesApiEntityAlerts?`+new URLSearchParams({
                q: 'criteria',
                entityUrn: "urn:li:fs_salesCompany:"+companyId,
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
        id: companyId+'tab',
        js: ["tabInject.js"],
        matches: ["<all_urls>"],
        runAt: "document_start"
    }])
    let companyHomeUrl=`https://www.linkedin.com/company/${companyId}/`
    let newTabObj=await openNewTab(companyHomeUrl,true,true)
}
const practiceProfile=async(profileId)=>{
    await sleep(2000)
    // let profs=getProfileData(profileId)
    let profs=getCompanyData(profileId)

}



practiceProfile('rob-simpson-96a36823')
// practiceProfile('safaricom')
let setSalesHeaders=(dets)=>{
    if(dets.initiator && !dets.initiator.includes('chrome')){
        if(dets.url.includes('sales-api')){
            let {requestHeaders}=dets
            chrome.storage.local.set({SNHeaders:requestHeaders})
            // requestHeaders.forEach(val=>{
            //     neededHeaders[val.name]=val.value
            // })
        }
    }
}
chrome.webRequest.onBeforeSendHeaders.addListener(setSalesHeaders
    ,{urls:["*://*.linkedin.com/*/*"]},["extraHeaders","requestHeaders"])


    chrome.webRequest.onCompleted.addListener((dets)=>{
        if(dets.initiator){
            if(!(dets.initiator.includes('chrome-extension'))){
                const {url,tabId}=dets
                if(url.includes('sales-api') && salesToBeMadeLen>0){
                    sendMessageToTab(tabId,{getSales:true,length:salesToBeMadeLen})
                }
                if(url.includes('voyager/api')&& toBeMadeLen>0){
                    sendMessageToTab(tabId,{getVoyager:true,length:toBeMadeLen})

                }
            }
        }

    },{urls:["*://*.linkedin.com/*/*"]},["responseHeaders","extraHeaders"])