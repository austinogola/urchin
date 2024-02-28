
const openNewTab=(url,wait)=>{
    return new Promise((resolve, reject) => {
        chrome.tabs.create({url},ourTab=>{
            if(wait){
                chrome.tabs.onUpdated.addListener(function (tabId, info) {
                    if (info.status == 'complete') {
                      if(ourTab.id==tabId){
                        resolve(tabId)
                      }
                    }
                  });
            }else{
                resolve(ourTab.id)
            }
            
        })
    })
}