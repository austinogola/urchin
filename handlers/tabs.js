let userId, state, autoState, taskId
let AUTOS_FREQ,AUTOS_SIZE,AUTOS_ENABLED

let currentWindows=[]
chrome.windows.getAll(allWins=>{
    currentWindows=allWins.map(item=>item.id)
})


// setInterval(() => {
//     if(!tabsRunning && !recipesRunning){
//         console.log('Checking windows');
//         chrome.windows.getAll(allWins=>{
//             allWins.forEach(item=>{
//                 if(!currentWindows.includes(item.id)){
//                     chrome.windows.remove(item.id)
//                 }
//             })
//         })   
//     }
// }, 3600000);

  

const getTabs=(test)=>{
    return new Promise(async(resolve,reject)=>{
            let autosUri
            
            const tabsParams=new URLSearchParams({
                pageSize:test?100:AUTOS_SIZE,
                where:test?`userID='${userId}'`:
                `userID='${userId}' AND complete=false AND paused!=true`,
                user:userId,
                type:'tabs',
                request:'GET',
                
        
            })
            fetch(backendHost+'?'+tabsParams,{
                method:'POST',
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
    // console.log('Tab time');
    // console.log('tabsRunning is',tabsRunning);
    // console.log('recipesRunning is',recipesRunning);
    // console.log((!tabsRunning && !recipesRunning));
    if((!tabsRunning && !recipesRunning)){
        chrome.storage.local.get(['autoState','state'],async res=>{
            state=res.state
            autoState=res.autoState
            console.log('state',state);
            console.log('autoState',autoState);
            
            if((!state || state=='ON') && (!autoState || autoState=='ON') && AUTOS_ENABLED){
                let tabsArr=await getTabs()
                // let myTabs=tabsArr.filter(item=>item.name.includes('Paginate 2'))
                console.log(tabsArr);
                await runTabs(tabsArr)
            }
            
        })
    }else{
            
    }
    
    
    
}
const setSettings=()=>{
    return new Promise(async(resolve, reject) => {

        chrome.alarms.create(`setSettings`,{
            delayInMinutes:SET_FREQUENCY,
            periodInMinutes:SET_FREQUENCY
        }) 
    })
}
let tabInt
const setTabs=()=>{
    return new Promise(async(resolve, reject) => {
        // clearInterval(tabInt)
        // tabInt=setInterval(initTabs,AUTOS_FREQ*60*1000)

        chrome.alarms.create(`startTabs`,{
            delayInMinutes:AUTOS_FREQ,
            periodInMinutes:AUTOS_FREQ
        }) 
    })
}
// chrome.alarms.clearAll()


let tabActions=[]
let tabRuleObj={}
chrome.storage.local.set({tabRuleObj})

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
        // console.log(action_array,repeat);
        // console.log('Repeat-->',repeat);
          const LIMIT=limit
        let MAX_RESET=max_reset
        let rep_count=1
        chrome.runtime.onMessage.addListener(async(request, sender, sendResponse)=>{
            if(request.string_status && tab_expecting=='string_status'){
                // console.log(request);
                tab_expecting='stopper_result'
                assuredSendMessage(tabId,{check_stopper:true,stopper:stop_if_present})
            }
            if(request.stopper_result && tab_expecting=='stopper_result'){
                // console.log(request);
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
    const updateTabParams=new URLSearchParams({
        pageSize:AUTOS_SIZE,
        where:`userID='${userId}' AND complete=false`,
        user:'rob1',
        type:'tabs',
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
    .catch(err=>{
        console.log(err.message)
       })
    

}

let tabsRunning=false
chrome.storage.local.set({tabRuleObj:{}})
const runTabs=(arr)=>{
    return new Promise(async(resolve, reject) => {
        chrome.storage.local.set({normRules:[]})

        const runSingleTab=async(tabObj)=>{
            return new Promise(async(resolve, reject) => {
                if(Object.keys(tabObj)[0]){
                    console.log('Running tab',tabObj);
                    tabsRunning=true
                    const {rules,objectId,name,actions,webhook_destination,
                        active_window,remove_window}=tabObj

                    
                    let parsedAction=await parseAction(actions)
                    console.log(parsedAction);
                    tabRuleObj={rules,objectId,name,webhook_destination}
                    chrome.storage.local.set({tabRuleObj})
                    chrome.storage.local.set({tabLimit:parsedAction.limit})
                    chrome.storage.local.set({interceptedArr:[]})
                    
                    chrome.webRequest.onCompleted.removeListener(normRuleChecker)
                    chrome.webRequest.onCompleted.addListener(tabMatch,{urls:["<all_urls>"]},["responseHeaders","extraHeaders"])
                    let newTabObj=await openNewTab(tabObj.target_page,true,active_window)
                    let newTab=newTabObj.tabId
                    let newWindow=newTabObj.windowId
                    chrome.windows.onRemoved.addListener((windowId)=>{
                        if(windowId==newWindow){
                          // tabsRunning=false
                          // recipesRunning=false
                          resolve('CLOSED')
                        }
                      })
                    
                    parsedAction.tabId=newTab
                    let cR=await cyclicRunTab(parsedAction,newTab)
                    console.log(cR);
                    tabRuleObj={}
                    chrome.storage.local.set({tabRuleObj})
                    chrome.webRequest.onCompleted.addListener(normRuleChecker,
                        {urls:["*://*.linkedin.com/*/*"]},["responseHeaders","extraHeaders"])
                        
                    if(!(remove_window===false)){
                        await sleep(1000)
                        chrome.webRequest.onCompleted.removeListener(tabMatch)
                        await sleep(1000)
                        // await unregisterAllDynamicScripts()
                        // chrome.windows.remove(newWindow,function ignore_error() { void chrome.runtime.lastError; })
                    }
                    updateTab(objectId)
                    resolve('FINN')
                }
            })
        }
        if(Array.isArray(arr)){
        
            while(arr[0]){
                
                let tabObj=arr.shift()
                if(Object.keys(tabObj).length>0){
                    tabsRunning=true
                    let tabVal=await runSingleTab(tabObj)
                    const randomInteger = Math.floor(Math.random() * 6) + 5
                    await sleep(randomInteger*1000)
                }else{
                    console.log('Empty object');
                }
                
            }
            tabsRunning=false
            console.log('Finished');
            if(openWindow){
                chrome.windows.remove(openWindow,function ignore_error() { void chrome.runtime.lastError; })
            }

            
            
            
            chrome.storage.local.set({normRules:normRules})

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