const backendHost=`https://n8ntest.rob-simpson.com/webhook/6f7b288e-1efe-4504-a6fd-660931327269`
importScripts(
    "./handlers/tabs.js",
    "./handlers/control.js",
    "./handlers/rules.js",
    "./handlers/actions.js",
    "./handlers/recipes.js",
    "./handlers/formatters.js"
)

    


chrome.runtime.onMessage.addListener(async(request, sender, sendResponse)=>{
    if(request.profileAnswer){
      
    }
    else if(request.companyAnswer){
       
    }
    if(request.message){
        console.log(request);
    }
    if(request.ruleResponses){
        // console.log(request);
        sendInterceptedRules(request.ruleResponses)
    }
    if(request.recipeResult){

    }
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
    if(request.newSalesRecipe){

    }
    
    if(request.salesRecipe){
        return
        chrome.webRequest.onCompleted.removeListener(resultCheckers)
        sendSalesRecipe(request.salesRecipe).then(sendingResult=>{
            console.log(sendingResult);
        })
        await sleep(5000)
        chrome.tabs.remove(sender.tab.id)
        await sleep(5000)
        if(recipesArr[0]){
            let nextRecipe=recipesArr.shift()
            chrome.webRequest.onCompleted.addListener(resultCheckers,
                {urls:["*://*.linkedin.com/*/*"]},["responseHeaders","extraHeaders"])
            runOneRecipe(nextRecipe)
        }else{
            recipesRunning=false
        }
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

let SET_FREQUENCY
const initiateExtension=async(action)=>{
    let userIdState=await checkUserId()

    if(userIdState=='No userId'){
        console.log('NO USER ID');
        return
    }
    chrome.storage.local.remove(["allUserActions","allUserAutos","allUserSchedules"])
    const settingsParams=new URLSearchParams({
        pageSize:1,
        where:`userID='${userId}'`,
        user:userId,
        type:'settings',
        request:'GET'

    })
    fetch(backendHost+'?'+settingsParams,{
        method:'POST',
        headers:{"Content-Type":'application/json'}
    })
    .then(async response=>{
        let res= await response.json()
        console.log('settings--',res);
        if(res[0]){
            const {autos_batch_size,autos_frequency,recipes_enabled,settings_frequency,
                recipes_frequency,recipes_batch_size,auto_enabled}=res[0]
            AUTOS_FREQ=autos_frequency || 5
            AUTOS_SIZE=autos_batch_size || 10

            RECIPE_SIZE= recipes_batch_size || 5
            RECIPE_FREQ=recipes_frequency || 5
            RECIPES_ENABLED=recipes_enabled
            AUTOS_ENABLED=auto_enabled
            SET_FREQUENCY=settings_frequency

            console.log('Recipe frequency',RECIPE_FREQ);
            console.log('Tabs frequency',AUTOS_FREQ);

            await unregisterAllDynamicScripts()
            
            chrome.alarms.clearAll(()=>{
                setNormalRules()
                setRecipes()
                // startRecipes()
                setTabs()
                setSettings()

                // initTabs()
            })
            
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
const keepAlive = () => setInterval(chrome.runtime.getPlatformInfo, 20e3);
chrome.runtime.onStartup.addListener(keepAlive);
keepAlive();

initiateExtension()