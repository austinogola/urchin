let received_tab_action=false
chrome.runtime.onMessage.addListener(async(request,sender,sendResponse)=>{
    if(request==='ready?'){
        sendResponse('ready')
    }
    if(request.getSales){
        sendResponse('getting sales')
        const {length}=request
        let salesUrlsToBeReturned=JSON.parse(localStorage.getItem('salesUrlsToBeReturned'))
        if(salesUrlsToBeReturned.length>=length){
            chrome.runtime.sendMessage({recipes:salesUrlsToBeReturned})
        }
        
    }
    if(request.getVoyager){
        sendResponse('getting voyager')
        const {length}=request
        let urlsToBeReturned=JSON.parse(localStorage.getItem('urlsToBeReturned'))
        console.log(urlsToBeReturned);
        if(urlsToBeReturned.length>=length){
            chrome.runtime.sendMessage({recipes:urlsToBeReturned})
        }
        
        
    }
    if(request.tab_action && !received_tab_action){
        sendResponse('Received')
        console.log(request);
        const {tabId}=request
        chrome.storage.local.get('tabActions',res=>{
            console.log(res);
            if(res.tabActions){
                received_tab_action=true
                let tabActions=res.tabActions
                received_tab_action=true
                let this_tab_action=tabActions.filter(item=>item.tabId==tabId)[0]
                runActions(this_tab_action,tabId)

            }
        })
    }
    if(request.runString){
        sendResponse('Running string')
        let string_status=await runString(request.runString)
        chrome.runtime.sendMessage({string_status})

    }
    if(request.check_stopper){
        sendResponse('Checking Stopper')
        const {stopper}=request
        let target=await loadSelector(stopper)
        if(target==null){
            chrome.runtime.sendMessage({stopper_result:'NOT FOUND'})
        }else{
            chrome.runtime.sendMessage({stopper_result:'PRESENT'})
        }
    }
    if(request=='check intercepted'){
        checkIntercepted()
    }
    if(request=='connect to me'){
        sendResponse('connecting to you')
        var port = chrome.runtime.connect({name: "action_port"});
        port.onMessage.addListener(async(msg,port)=>{
            if(msg.control){
                
                const {type,target,depth}=msg

                if(type=='scroll'){
                    console.log('scrolling');
                    if(target=='window'){
                        // window.scrollBy({top:depth,behavior:'smooth'})
                        setTimeout(() => {
                            console.log('Scrolling windows',depth);
                            window.scrollBy({top:500,behavior:'smooth'})
                            port.postMessage({performed:true,action:type})
                            
                        }, 1500);
                        
                    }else{
                        let targ=await loadSelector(target)
                        if(targ){
                            console.log(targ);
                            setTimeout(() => {
                                console.log('Scrolling target',depth);
                                targ.scrollBy({top:400,behavior:'smooth'})
                                port.postMessage({performed:true,action:type})
                                
                            }, 1500);
                            
                            
                        }else{
                            port.postMessage({performed:false,action:type,reason:"target not found"})

                        }
                        
                    }

                }
                else if(type=='click'){
                    let targ=await loadSelector(target)
                    console.log(targ);
                    if(targ){
                        // console.log(targ);
                        setTimeout(() => {
                            targ.click()
                            port.postMessage({performed:true,action:type})
                        }, 500);
                        
                    }else{
                        console.log('Not found');
                        port.postMessage({performed:false,action:type,reason:"target not found"})

                    }
                    
                }
            }
        })
    }
    if(request.control){
        const {type,target}=request
        if(type=='scroll'){

        }
        else if(type=='click'){

        }
    }
})


const checkIntercepted=()=>{
    let sentIntercepts=JSON.parse(localStorage.getItem('sentIntercepted'))
    let interceptArr=JSON.parse(localStorage.getItem('interceptArr'))
    if(interceptArr!==null){
        interceptArr=interceptArr.filter(item=>!(sentIntercepts.includes(item.timestamp)))
        if(interceptArr[0]){
            interceptArr.forEach(obj => {
                chrome.runtime.sendMessage({tabIntercepted:obj})
                sentIntercepts.push(obj.timestamp)
            });
        }
        
    }
    localStorage.setItem("sentIntercepted",JSON.stringify(sentIntercepts))
}

const  loadSelector=async(selector,all)=> {
    console.log('looking for',selector);
    var found = false;
    var raf;
    let el
    let times=0
    return new Promise((resolve,reject)=>{
        (async function check(){
            // el=document.querySelectorAll(selector)
            el=$(selector)
            times+=1
            console.log(el);
            
            if (el && el[0]) {
                found = true;
                // console.log('Found,',el);
                cancelAnimationFrame(raf);
                all?resolve(el):resolve(el[0])
                
                if(!found){
                raf = requestAnimationFrame(check);
                }
                
            
            } else if(times>=5){
                resolve(null)
            }
            else {
                await sleep(500)
                raf = requestAnimationFrame(check);
                // console.log('Not found ',selector);
            }
            })();
    })
  }

  const sleep=(ms)=>{
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('TIMEOUT')
        }, ms);
    })
}

let started_actions=false
const runString=async(action_array)=>{
    return new Promise(async(resolve, reject) => {
        for (let i = 0; i < action_array.length; i++) {
            const itemArr = action_array[i].split(' ')
            console.log(itemArr);
            if(itemArr.includes('wait')){
                let length=parseFloat(itemArr[1])
                console.log(`Waiting ${length}`);
                await sleep(length*1000)
                console.log('waited')
            }
            else if(itemArr.includes('click')){
                let target=itemArr[1]
                let targ=await loadSelector(target)
                console.log('clicking', targ);
                if(targ!=null){
                    targ.click()
                }
                
                
            }
            else if(itemArr.includes('scroll')){
                let target=itemArr[1]
                let depth=parseInt(itemArr[2])
                if(target=='window'){
                    console.log('Scrolling window');
                    window.scrollBy({top:depth,behavior:'smooth'})
                }else{
                    let targ=await loadSelector(target)
                    console.log('Scrolling',null);
                    if(targ!=null){
                        targ.scrollBy({top:depth,behavior:'smooth'})
                    }
                    
                }
                
            }
            else if(itemArr.includes('navigate')){
                let url=itemArr[1]
                window.location.href=url
               
                
            }
            
        }
        resolve('DONE')
    })
   

}
const runActions=(act_ob,tabId)=>{
    return new Promise((resolve, reject) => {
        if(!started_actions){
            started_actions=true
            const {action_array,index,iteration,repeat,stop_if_present}=act_ob
            for (let i = 0; i < repeat; i++) {
                chrome.storage.local.get('tabActions',async res=>{
                    if(res.tabActions){
                        let tabActions=res.tabActions
                        let this_tab_action=tabActions.filter(item=>item.tabId==tabId)[0]
                        this_tab_action.iteration+=1
                        console.log(this_tab_action);
                        const tts=[this_tab_action]
                        chrome.storage.local.set({tabActions:tts})

                        for (let i = index; i < action_array.length; i++) {
                            const itemArr = action_array[i].split(' ')
                            if(itemArr.includes('wait')){
                                let length=parseFloat(itemArr[1])
                                console.log(`Waiting ${length}`);
                                await sleep(length*1000)
                                console.log('waited')
                            }
                            else if(itemArr.includes('click')){
                                let target=itemArr[1]
                                let targ=await loadSelector(target)
                                console.log(targ);
                                targ.click()
                                
                            }
                            else if(itemArr.includes('scroll')){
                                let target=itemArr[1]
                                let depth=parseInt(itemArr[2])
                                if(target=='window'){
                                    console.log('Scrolling window');
                                    window.scrollBy({top:depth,behavior:'smooth'})
                                }else{
                                    let targ=await loadSelector(target)
                                    console.log(targ);
                                    targ.scrollBy({top:depth,behavior:'smooth'})
                                }
                                
                            }
                            else if(itemArr.includes('navigate')){
                                let target=itemArr[1]
                                console.log(itemArr);
                                
                            }
                            
                        }
                    }
                })
                
                
                
            }
            console.log(act_ob);
        }
        
    })
}

// chrome.runtime.sendMessage('check my actions')
