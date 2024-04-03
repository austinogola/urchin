const parseAction=async(action)=>{
    return new Promise(async(resolve, reject) => {
        const {flow,stop_if_present,repeat,stop_if_repeats,limit,max_reset}=action
        let fullArr=[]
       ;
        for (let i = 0; i < flow.length; i++) {
            const flowArr = flow[i];
            let fullAct=await spreadOutMiniAction(flowArr)
            fullArr=[...fullArr,...fullAct]
        }

        resolve({
            action_array:fullArr,
            stop_if_present,
            stop_if_repeats,
            repeat,
            limit:(limit || limit===0)?limit:1000,
            max_reset:max_reset?max_reset:1000,
        })
    })
    
}
const spreadOutMiniAction=(actionArr)=>{
    return new Promise(async(resolve, reject) => {
        let repeat=1
        let actualArr=[...actionArr]
       actionArr.forEach(element => {
            var regex = /X(\d+)/i;
            var match = element.match(regex);
            if (match && match[1]) {
                repeat=match[1]
                actualArr=actualArr.filter(item=>!regex.test(item))
            }
       });
       actualArr=Array.from({ length: repeat }, () => actualArr).flat();
       resolve(actualArr)
       
        
    })
}


const sleep=(ms)=>{
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('TIMEOUT')
        }, ms);
    })
}

const  unregisterAllDynamicScripts=()=> {
    return new Promise(async(resolve, reject) => {
        try {
            const scripts = await chrome.scripting.getRegisteredContentScripts();
            const scriptIds = scripts.map(script => script.id);
            if(scriptIds[0]){
                try {
                    await chrome.scripting.unregisterContentScripts({'ids':scriptIds});
                } catch (error) {
                }
                
                resolve('unregistered all dynamic scripts')
                
            }else{
                resolve('no dynamic scripts to unregister')
            }
            
            
          } catch (error) {
            console.log(error.message);
            resolve(error.message)
            // throw new Error(message, {cause : error});
          }
    })
    
  }