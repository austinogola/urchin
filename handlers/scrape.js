

const scrapeRecipe=(recpObj)=>{
    return new Promise(async(resolve, reject) => {
        const {input,objectId,destination_webhook_url,label}=recpObj
        chrome.runtime.onMessage.addListener(async(request, sender, sendResponse)=>{
            if(request.scrapeResult){
                const result=request.scrapeResult
                await sleep(2000)
                resolve(result)
            }
        })
        let newTabObj=await openNewTab(input,true,true)
        await sleep(2000)
        
        chrome.tabs.sendMessage(newTabObj.tabId,'scrape whole')
    })
}

const sendScraped=()=>{

}



