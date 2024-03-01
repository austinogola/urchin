























const parseAction=async(action)=>{
    return new Promise(async(resolve, reject) => {
        const {flow,stop_if_present,repeat,stop_if_repeats}=action
        let fullArr=[]
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
            iteration:0,
            index:0
        })
    })
    
}
const spreadOutMiniAction=(actionArr)=>{
    return new Promise(async(resolve, reject) => {
        let repeat=1
        let actualArr=[...actionArr]
       actionArr.forEach(element => {
            var regex = /X(\d)/i;
            var match = element.match(regex);
            if (match && match[1]) {
                repeat=match[1]
                actualArr=actualArr.filter(item=>!regex.test(item))
            }
       });
    //    console.log(`Running ${actualArr} for ${repeat}`);
       actualArr=Array.from({ length: repeat }, () => actualArr).flat();

    //    let res=await runByRepeat(tabId,actualArr)
       resolve(actualArr)
       
        
    })
}

const performActionArray2=(actionArr,tabId,stopper)=>{
    return new Promise(async(resolve, reject) => {
        let repeat=1
        let actualArr=[...actionArr]
       actionArr.forEach(element => {
            var regex = /X(\d)/i;
            var match = element.match(regex);
            if (match && match[1]) {
                repeat=match[1]
                actualArr=actualArr.filter(item=>!regex.test(item))
            }
       });
       console.log(`Running ${actualArr} for ${repeat}`);
       actualArr=Array.from({ length: repeat }, () => actualArr).flat();

       let res=await runByRepeat(tabId,actualArr)
       resolve(res)
       
        
    })
}

const runAction=(action,tabId)=>{
    return new Promise(async(resolve, reject) => {
        const {flow,stop_if_present,repeat,stop_if_repeats}=action
        console.log(flow,repeat);
        for (let h = 0; h < repeat; h++) {
            for (let i = 0; i < flow.length; i++) {
                const flowArr = flow[i];
                await performActionArray2(flowArr,tabId,stop_if_present)
            }
            
        }
        
    })
}

const checkStopper=(stopper,port)=>{
    console.log('Checking stopper');
    return new Promise((resolve, reject) => {
        port.onMessage.addListener(async(msg)=>{
            resolve(msg);

        })
        port.postMessage({checkStopper:true,stopper})
    })
}

const runSingleAction=(itemArr,port)=>{
    return new Promise(async(resolve, reject) => {
        port.onMessage.addListener(async(msg)=>{
            resolve(msg);
        })

        if(itemArr.includes('wait')){
            let length=parseFloat(itemArr[1])
            console.log(`Waiting ${length}`);
            await sleep(length*1000)
            resolve('waited')
        }
        else if(itemArr.includes('click')){
            let target=itemArr[1]
            port.postMessage({control:true,type:'click',target})
            
        }
        else if(itemArr.includes('scroll')){
            let target=itemArr[1]
            let depth=parseInt(itemArr[2])
            port.postMessage({control:true,type:'scroll',target,depth})
            
        }
        else if(itemArr.includes('navigate')){
            let target=itemArr[1]
            console.log(itemArr);
            
        }
        
    })
}

const runItemWithFeedback=(item,port)=>{
    return new Promise(async(resolve, reject) => {
        
        if(item.wait){
            const {wait}=item
            // console.log('Waiting ',wait ,'seconds');
            await sleep(wait * 1000)
            resolve ('waited')
        }else{
            if(item.event=='navigate'){
                const {url}=item
                console.log('navigating to',url);
                chrome.tabs.update(runTab,{url},(res)=>{
                    chrome.tabs.onUpdated.addListener((tabId,changeInfo)=>{
                        if(tabId==runTab && changeInfo.status && changeInfo.status=='complete' ){
                            resolve('navigated')
                        }
                    }
                      )
                })
                
            }else{
                const {event,target,depth}=item
                // console.log(`${event}ing`);
                port.postMessage({act_action:event,target,depth})
            }
            
            
        }
    })
    

}
const runByRepeat=(tabId,actualArr)=>{
    return new Promise(async(resolve, reject) => {
        let connected=false
        const runThis=async(arr,ind,port)=>{
            return new Promise(async(resolve, reject) => {
                for (let j = ind; j < arr.length; j++) {
                    const itemArr = arr[j].split(' ')
                    let res=await runSingleAction(itemArr,port)
                    index+=1
                    console.log(res);
                }
                resolve('DONE')
            })
           
            //checkStopper
            
            
        }
        let index=0
        chrome.runtime.onConnect.addListener(async port=>{
            port.onDisconnect.addListener(async function() {
                connected=false
                console.log("Port disconnected",port);
                let connection=await sendMessageToTab(tabId,'connect to me')
                resolve('DONE')
            });
            if(!connected && port.name=='action_port' ){
                connected=true
                console.log(actualArr);
                await runThis(actualArr,index,port)
                
                resolve('DONE')
                
            }
            
       })
       let connection=await sendMessageToTab(tabId,'connect to me')
    })
}




const sleep=(ms)=>{
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('TIMEOUT')
        }, ms);
    })
}