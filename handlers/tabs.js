const getTabs=(test)=>{
    return new Promise(async(resolve,reject)=>{
            let autosUri
            if(test){
                autosUri=`https://eu-api.backendless.com/F1907ACC-D32B-5EA1-FFA2-16B5AC9AC700/E7D47F5F-7E77-4E8D-B6CE-E2E7A9C6C1C2/data/tabs?pageSize=${5}&where=userID%3D'${'test'}'`

            }else{
                autosUri=`https://eu-api.backendless.com/F1907ACC-D32B-5EA1-FFA2-16B5AC9AC700/E7D47F5F-7E77-4E8D-B6CE-E2E7A9C6C1C2/data/tabs?pageSize=${AUTOS_SIZE}&where=userID%3D'${userId}'%20AND%20complete%20%3D%20false&sortBy=%60created%60%20desc`
            }
            fetch(autosUri,{
                method:'GET',
                headers:{
                    'Content-Type':'application/json'
                }
            })
            .then(async res=>{
                if(res.status==200){
                    let result=await res.json()
                    resolve(result) 
                }else{
                    resolve(`Could not fetch for ${userId}`) 
                }
            })
            .catch(err=>{
                resolve(err.message)
            })

        
    })

}
const initTabs=async()=>{
    let tabsArr=await getTabs()
    await runTabs(tabsArr)
    
}

const setTabs=()=>{
    return new Promise(async(resolve, reject) => {
        
        chrome.alarms.clearAll()
        chrome.alarms.create(`startTabs`,{
            delayInMinutes:AUTOS_FREQ,
            periodInMinutes:AUTOS_FREQ
        }) 
    })
}

chrome.alarms.onAlarm.addListener(async(Alarm)=>{
    if(Alarm.name=='startTabs'){
        initTabs()
    }
})

let tabActions=[]
let tabRuleObj={}

const cyclicRunTab=(parsedAction,tabId)=>{
    return new Promise(async(resolve, reject) => {
        // console.log(parsedAction,tabId);
        const {action_array,index,iteration,repeat,stop_if_present}=parsedAction
        let remaining_reps=repeat
        chrome.runtime.onMessage.addListener(async(request, sender, sendResponse)=>{
            if(request.fdbk){
                sendMessageToTab(tabId,{check_stopper:true,stopper:stop_if_present})
                // chrome.runtime.sendMessage(tabId,{check_stopper:true,stopper:stop_if_present})

            }
            if(request.stopper_result){
                if(request.stopper_result=='NOT FOUND'){
                    if(remaining_reps>0){
                        remaining_reps-=1
                        // let ww=await sendMessageToTab(tabId,{runString:action_array})
                        // chrome.runtime.sendMessage(tabId,{runString:action_array})

                    }else{
                        resolve('REPS')
                    }
                }else{
                    resolve('STOPPER')
                }
                
            }
        })
       
        remaining_reps-=1
        let ww=await sendMessageToTab(tabId,{runString:action_array})
        // chrome.runtime.sendMessage(tabId,{runString:action_array})
        
     
    })
}

const updateTab=async(id)=>{
    let ob={
        complete:true
    }
    let updateUrl=`https://eu-api.backendless.com/F1907ACC-D32B-5EA1-FFA2-16B5AC9AC700/E7D47F5F-7E77-4E8D-B6CE-E2E7A9C6C1C2/data/tabs/${id}`

    fetch(updateUrl,{
        method:'PUT',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify(ob)
    })

}
const runTabs=(arr)=>{
    return new Promise(async(resolve, reject) => {
        if(Array.isArray(arr)){
            for (let i = 0; i < arr.length; i++) {
                const tabObj = arr[i];
                const {rules,objectId,name,actions,webhook_destination}=tabObj
                tabRuleObj={rules,objectId,name,webhook_destination}
                chrome.storage.local.set({tabRuleObj})

                await chrome.scripting.registerContentScripts([{
                    id: tabObj.objectId,
                    js: ["tabInject.js"],
                    matches: ["<all_urls>"],
                    runAt: "document_start"
                }])
                let newTab=await openNewTab(tabObj.target_page,true)
                let parsedAction=await parseAction(actions)
                parsedAction.tabId=newTab
                let cR=await cyclicRunTab(parsedAction,newTab)
                console.log(cR);
                // await chrome.scripting.unregisterContentScripts(objectId);
                // updateTab(objectId)
                
            }

        }else{
            console.log(autosArr);
        }
    })
}


const sendMessageToTab =(tabId, message, maxRetries = 10, retryInterval = 1500) =>{
    
    return new Promise((resolve, reject) => {
        let retries = 0;

        const sendMessageAttempt = () => {
            if (retries >= maxRetries) {
            //   console.log(`Maximum retries (${maxRetries}) reached. Message not sent.`);
              resolve('FAILED')
              return;
            }
        
            chrome.tabs.sendMessage(tabId, message, response => {
              if (chrome.runtime.lastError) {
                // console.error(chrome.runtime.lastError.message);
                retries++;
                setTimeout(sendMessageAttempt, retryInterval);
              }
              else{
                  resolve('SENT')
                  return
              }
            });
        };

        sendMessageAttempt();
    })
  }