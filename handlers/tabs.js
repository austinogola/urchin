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

const setTabs=()=>{
    return new Promise(async(resolve, reject) => {
        let autosArr=await getTabs()
        runTabs(autosArr)
        
        
    })
}
const tabRules=[]
const runTabs=(arr)=>{
    return new Promise((resolve, reject) => {
        if(Array.isArray(arr)){
            for (let i = 0; i < arr.length; i++) {
                const tabObj = arr[i];
                tabRules=tabObj.rules
                chrome.storage.local.set({tabRules})

                chrome.scripting.registerContentScripts([{
                    id: tabObj.objectId,
                    js: ["tabInject.js"],
                    matches: ["<all_urls>"],
                    runAt: "document_start"
                }])
                .then(async() => {
                    let newTab=await openNewTab(tabObj.target_page,true)
                    
                })
                
                
            }

        }else{
            console.log(autosArr);
        }
    })
}