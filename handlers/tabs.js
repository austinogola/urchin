let userId, state, autoState, taskId
let AUTOS_FREQ,AUTOS_SIZE

const getTabs=(test)=>{
    return new Promise(async(resolve,reject)=>{
            let autosUri
            if(test){
                autosUri=`https://eu-api.backendless.com/F1907ACC-D32B-5EA1-FFA2-16B5AC9AC700/E7D47F5F-7E77-4E8D-B6CE-E2E7A9C6C1C2/data/tabs?pageSize=${5}&where=userID%3D'${userId}'`

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
    chrome.storage.local.get(['autoState','state'],async res=>{
        state=res.state
        autoState=res.autoState
        
        if((!state || state=='ON') && (!autoState || autoState=='ON')){
            let tabsArr=await getTabs()
            // let myTabs=tabsArr.filter(item=>item.name.includes('Paginate 2'))
            console.log(tabsArr);
            await runTabs(tabsArr)
        }
        // let tabsArr=await getTabs(true)
        //     let myTabs=tabsArr.filter(item=>item.name.includes('Paginate 2'))
        //     console.log(myTabs);
        //     await runTabs(myTabs)
    })
    
    
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
// chrome.alarms.clearAll()


chrome.alarms.onAlarm.addListener(async(Alarm)=>{
    if(Alarm.name=='startTabs'){
        initTabs()
    }
})

let tabActions=[]
let tabRuleObj={}

const assuredSendMessage=(tabId,msg)=>{
    return new Promise(async(resolve, reject) => {
        let tabStatus=await sendMessageToTab(tabId,'ready?')
        let times=0
        while(tabStatus=='FAILED' && times<3 ){
            tabStatus=await sendMessageToTab(tabId,'ready?')
            times++
        }
        if(tabStatus=='FAILED'){
            resolve(tabStatus)
        }else{
            chrome.tabs.sendMessage(tabId,msg,response => {
                if (chrome.runtime.lastError) {
                    console.log(chrome.runtime.lastError.message);
                    resolve('FAILED')
                }
                resolve(response)
             })

        }
    })
}

const cyclicRunTab=(parsedAction,tabId)=>{
    return new Promise(async(resolve, reject) => {
        // console.log(parsedAction,tabId);
        let tab_expecting=''
        chrome.tabs.onUpdated.addListener(function (tabNum, info) {
            if (info && info.status == 'loading') {
              if(tabNum==tabId){
                // if(MAX_RESET>0){
                //     MAX_RESET=MAX_RESET-1
                //     console.log('Resetting limit to',limit)
                //     chrome.tabs.sendMessage(tabId,{resetLimit:true,limit})
                // }
                
              }
            }
          });
        const {action_array,repeat,stop_if_present,limit,max_reset}=parsedAction
        console.log(action_array,repeat);
        console.log('Repeat-->',repeat);
          const LIMIT=limit
        let MAX_RESET=max_reset
        let rep_count=1
        chrome.runtime.onMessage.addListener(async(request, sender, sendResponse)=>{
            if(request.string_status && tab_expecting=='string_status'){
                console.log(request);
                tab_expecting='stopper_result'
                assuredSendMessage(tabId,{check_stopper:true,stopper:stop_if_present})
            }
            if(request.stopper_result && tab_expecting=='stopper_result'){
                console.log(request);
                tab_expecting='string_status'
                if(request.stopper_result=='NOT FOUND'){
                    let okk=rep_count<=repeat
                    if(okk){
                        console.log('Repetition ',rep_count,'of',repeat);
                        assuredSendMessage(tabId, {doString:action_array,limit:LIMIT,stopper:stop_if_present})
                        rep_count+=1
                    }else{
                        resolve(`FINISHED ${repeat} REPS`)
                        return
                    }
                }else{
                    resolve('FOUND STOPPER')
                    return
                }
            }
            return
            if(request.string_status && tab_expecting=='string_status'){
                console.log(request);
                tab_expecting='stopper_result'
                await sleep(900)
                assuredSendMessage(tabId,{check_stopper:true,stopper:stop_if_present})
                

            }
            if(request.stopper_result && tab_expecting=='stopper_result'){
                console.log(request);
                tab_expecting='string_status'
                await sleep(900)
                if(request.stopper_result=='NOT FOUND'){
                    if(rep_count>=0){
                        rep_count-=1
                        assuredSendMessage(tabId, {doString:action_array,limit:limit})

                    }else{
                        resolve(`FINISHED ${repeat} REPS`)
                        return
                    }
                }else{
                    resolve('FOUND STOPPER')
                    return
                }
                
            }
        })
        
        tab_expecting='string_status'
        console.log('Repetition ',rep_count);
        assuredSendMessage(tabId, {doString:action_array,limit:LIMIT,stopper:stop_if_present})
        rep_count+=1
        
     
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
                const {rules,objectId,name,actions,webhook_destination,
                    active_window,remove_window}=tabObj
                
                let parsedAction=await parseAction(actions)
                console.log(parsedAction);
                tabRuleObj={rules,objectId,name,webhook_destination}
                // console.log(tabRuleObj);
                chrome.storage.local.set({tabRuleObj})
                chrome.storage.local.set({tabLimit:parsedAction.limit})
                chrome.storage.local.set({interceptArr:[]})
                await unregisterAllDynamicScripts()
                await chrome.scripting.registerContentScripts([{
                    id: tabObj.objectId,
                    js: ["tabInject.js"],
                    matches: ["<all_urls>"],
                    runAt: "document_start"
                }])
                let newTabObj=await openNewTab(tabObj.target_page,true,active_window)
                let newTab=newTabObj.tabId
                let newWindow=newTabObj.windowId
                
                parsedAction.tabId=newTab
                let cR=await cyclicRunTab(parsedAction,newTab)
                console.log(cR);
                chrome.storage.local.set({tabRuleObj})
                await unregisterAllDynamicScripts()
                if(!(remove_window===false)){
                    await sleep(10000)
                    chrome.windows.remove(newWindow,function ignore_error() { void chrome.runtime.lastError; })
                }
                updateTab(objectId)
                
            }

        }else{
            console.log(arr);
            resolve(arr)
        }
    })
}


const sendMessageToTab =(tabId, message, maxRetries = 15, retryInterval = 300) =>{
    
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
                  resolve(response)
                  return
              }
            });
        };

        sendMessageAttempt();
    })
  }