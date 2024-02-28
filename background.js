importScripts(
    "./handlers/tabs.js",
    "./handlers/control.js")

chrome.runtime.onMessage.addListener(async(request, sender, sendResponse)=>{
    if(request.state){
        state=request.state  
        chrome.storage.local.set({state:state})
    }
    if(request.autos){
        autoState=request.autos 
        chrome.storage.local.set({autoState:autoState})
    }
    if(request.setId){
        if(request.setId!=='REMOVED'){
            userId=request.setId
            chrome.storage.local.set({userId:userId})
        }
        if(request.reload){
            initiateExtension('chrome_key')
        }
    }
    if(request.setTask){
        if(request.setTask!=='REMOVED'){
            task=request.setTask
            chrome.storage.local.set({task:task})
        }
    }
})

let userId, state, autoState, task
let AUTOS_FREQ,AUTOS_SIZE

let checkUserId=()=>{
    return new Promise((resolve, reject) => {
        if(userId){
            resolve(userId)
        }else{
            chrome.storage.local.get('userId',res=>{
                if(res.userId){
                    userId=res.userId
                    resolve(userId)
                }else{
                    resolve('No userId')
                }
            })
        }
    })
}


const initiateExtension=async(action)=>{
    let userIdState=await checkUserId()

    if(userIdState=='No userId'){
        console.log('NO USER ID');
        return
    }
    chrome.storage.local.remove(["allUserActions","allUserAutos","allUserSchedules"])
    fetch(`https://eu-api.backendless.com/F1907ACC-D32B-5EA1-FFA2-16B5AC9AC700/E7D47F5F-7E77-4E8D-B6CE-E2E7A9C6C1C2/data/settings?pageSize=1&where=userID%3D'${userId}'`,{
        method:'GET'
    })
    .then(async response=>{
        let res= await response.json()
        if(res[0]){
            console.log(res[0]);
            const {autos_batch_size,autos_frequency}=res[0]
            AUTOS_FREQ=autos_frequency || 5
            AUTOS_SIZE=autos_batch_size || 10
            setTabs()
        }else{
            console.log(`No settings for ${userId}`,res);
        }
        // if(action=='chrome_key' && res[0] && res[0].objectId){
        //     sendChromeKey(res[0].objectId)
        //     console.log(res[0]);
        // }
        // if(res[0]){
        //     setSettings(res[0])
        // }
        // else{
        //     setSettings() 
        // }
    })
    
}

initiateExtension()