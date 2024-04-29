
let openWindow
const openNewTab=(url,wait,active_window,stru_type)=>{
    return new Promise((resolve, reject) => {
      let ourTabId
      const listenForLoad=(tabId, info)=>{
        if (info.status == 'complete') {
          if(ourTabId && (ourTabId==tabId)){
            resolve({tabId:tabId,windowId:openWindow})
          }
        }
      }
      if(openWindow){
        chrome.tabs.onUpdated.addListener(listenForLoad);
        chrome.tabs.create({active:true,url,windowId:openWindow},(tab)=>{
          ourTabId=tab.id
        })
      }else{

        chrome.windows.create({
          focused:true,
          type:'normal',
          height:900,
          width:1600,
          url:url
      },async(window)=>{
          ourTabId=window.tabs[0].id
          openWindow=window.id
          if(wait){
            chrome.tabs.onUpdated.addListener(listenForLoad);
        }else{
          resolve({tabId:ourTabId,windowId:openWindow})
        }
        chrome.windows.onRemoved.addListener((windowId)=>{
          if(windowId==openWindow){
            openWindow=false
            // tabsRunning=false
            // recipesRunning=false
          }
        })
          
          
          // chrome.windows.update(window_Id,{state:"fullscreen"})
  
      })

      }
      
      
       
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