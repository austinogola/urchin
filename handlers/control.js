
const openNewTab=(url,wait,active_window,stru_type)=>{
    return new Promise((resolve, reject) => {
      
      chrome.windows.create({
        focused:active_window,
        type:'normal',
        height:900,
        width:1600,
        url:url
    },async(window)=>{
        let ourTabId=window.tabs[0].id
        if(wait){
          chrome.tabs.onUpdated.addListener(function (tabId, info) {
              if (info.status == 'complete') {
                if(ourTabId==tabId){
                  resolve({tabId:tabId,windowId:window.id})
                }
              }
            });
      }else{
        resolve({tabId:ourTabId,windowId:window.id})
      }
      chrome.windows.onRemoved.addListener((windowId)=>{
        if(windowId==window.id){
          // tabsRunning=false
          // recipesRunning=false
        }
      })
        
        
        // chrome.windows.update(window_Id,{state:"fullscreen"})

    })
       
    })
}


chrome.alarms.onAlarm.addListener(async(Alarm)=>{
  if(Alarm.name=='startTabs'){
      initTabs()
  }
  else if(Alarm.name=='startRecipes'){
    startRecipes()
  }
  else if(Alarm.name=='setSettings'){
    initiateExtension()
  }
})