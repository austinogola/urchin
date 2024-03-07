importScripts(
    "./handlers/tabs.js",
    "./handlers/control.js",
    "./handlers/rules.js",
    "./handlers/actions.js",
    "./handlers/recipes.js")

chrome.runtime.onMessage.addListener(async(request, sender, sendResponse)=>{
    if(request==='check my actions'){
        chrome.storage.local.get('tabActions',res=>{
            if(res.tabActions){
                let tabActions=res.tabActions
                let this_tab_action=tabActions.filter(item=>item.tabId==sender.tab.id)
                if(this_tab_action && this_tab_action[0]){
                    chrome.tabs.sendMessage(sender.tab.id,{tab_action:true,tabId:sender.tab.id})
                }
            }
        })
    }
    if(request.recipe){
        console.log(request);
    }
    if(request.string_status){
        
    }
    if(request.stopper_result){

    }
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
            taskId=request.setTask
            chrome.storage.local.set({taskId:taskId})
        }
    }
})


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
            const {autos_batch_size,autos_frequency}=res[0]
            AUTOS_FREQ=autos_frequency || 5
            AUTOS_SIZE=autos_batch_size || 10
            setTabs()
            // initTabs()
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