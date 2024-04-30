let received_tab_action=false


chrome.runtime.onMessage.addListener(async(request,sender,sendResponse)=>{
    if(request==='scrape whole'){
        const htmlContent = document.documentElement.outerHTML;
        chrome.runtime.sendMessage({scrapeResult:htmlContent})
    }
    if(request=='start sales'){
        sendResponse('starting sales')
        beginSalesHarvest()
    }
    if(request=='ready?'){
        sendResponse('I am ')
    }
    if(request=='check result'){
        sendResponse('Checking')
        
    }
    if(request.returnProfile){
        sendResponse('Checking')
        const profileId=request.returnProfile
        checkProfile(profileId)
        
    }
    if(request.returnCompany){
        sendResponse('Checking')
        const companyId=request.returnCompany
        checkCompany(companyId)
        
    }
    if(request.checkRuleResponse){
        // sendResponse("checking responses")
        // let url=request.checkRuleResponse
        clearNormalRuleResponses()
        // console.log(ruleResponses);

    }
    if(request.returnMade){
        let allReturned=JSON.parse(localStorage.getItem('newToBeReturned'))
        chrome.runtime.sendMessage({recipeResult:allReturned})
    }
   
    if(request.resetLimit){
        console.log(request);
        sendResponse('setting tabLimit')
        // console.log('setting tabLimit');
        // localStorage.setItem('tabLimit',request.limit)
    }
    if(request.getSales){
        sendResponse('getting sales')
        const {length}=request

        let checkInterval=setInterval(() => {
            let salesUrlsToBeReturned=JSON.parse(localStorage.getItem('salesUrlsToBeReturned'))
            if(salesUrlsToBeReturned && salesUrlsToBeReturned[0]){
                if(salesUrlsToBeReturned.length>=length){
                    chrome.runtime.sendMessage({recipes:salesUrlsToBeReturned,type:'sales'})
                    localStorage.setItem(salesUrlsToBeReturned,JSON.stringify([]))
                    chrome.storage.local.set({salesUrlsToBeReturned:[]})
                    clearInterval(checkInterval)
                }
            }
        }, 2500);

        
        
        
        
    }
    if(request.getVoyager){
        sendResponse('getting voyager')
        const {length}=request

        let checkInterval=setInterval(() => {
            let urlsToBeReturned=JSON.parse(localStorage.getItem('urlsToBeReturned'))
            if(urlsToBeReturned && urlsToBeReturned[0]){
                
                if(urlsToBeReturned.length>=length){
                    clearInterval(checkInterval)
                    localStorage.setItem(urlsToBeReturned,JSON.stringify([]))
                    chrome.storage.local.set({urlsToBeReturned:[]})
                    chrome.runtime.sendMessage({recipes:urlsToBeReturned,type:'voyager'})
                    
                    
                }
            }
        }, 2500);
        
        
        
        
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
    if(request.doString){
        sendResponse('Running string')
        const {doString,limit,stopper}=request
        // console.log(doString,limit,stopper);
        let string_status=await runString(doString,limit)
        chrome.runtime.sendMessage({string_status})
        let target=await loadSelector(stopper)
        if(target==null){
            chrome.runtime.sendMessage({stopper_result:'NOT FOUND'})
        }else{
            chrome.runtime.sendMessage({stopper_result:'PRESENT'})
        }

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
    if(request.checkIntercepted){
        const {url}=request
        newCheckIntercept(url)
    }
    if(request=='connect to me'){
        sendResponse('connecting to you')
        var port = chrome.runtime.connect({name: "action_port"});
    }
    if(request.control){
        const {type,target}=request
        if(type=='scroll'){

        }
        else if(type=='click'){

        }
    }
})

const checkCompany=(compId)=>{
    let returned=[...JSON.parse(localStorage.getItem('newToBeReturned'))]
    console.log(compId);
    console.log('previousAllReturned',returned);
    returned=returned.filter(item=>item.profile==compId)
    
    localStorage.setItem('newToBeReturned',JSON.stringify([]))
    chrome.runtime.sendMessage({companyAnswer:returned})
    
    
    
    
   
}

const clearNormalRuleResponses=()=>{
    let ruleResponses=localStorage.getItem('ruleResponses')?JSON.parse(localStorage.getItem('ruleResponses')):[]
    localStorage.setItem('ruleResponses', JSON.stringify([]));
    chrome.runtime.sendMessage({ruleResponses})
}
clearNormalRuleResponses()

const checkProfile=(profId)=>{
    let returned=[...JSON.parse(localStorage.getItem('newToBeReturned'))]
    returned=returned.filter(item=>item.profile==profId)

    localStorage.setItem('newToBeReturned',JSON.stringify([]))
    chrome.runtime.sendMessage({profileAnswer:returned})

}

const returnInterceptedSales=()=>{
    let allArray=['hires','openings','employees','alerts','personas']
    let interceptedSales=JSON.parse(localStorage.getItem('interceptedSales'))
    const interceptObj={
        response:{}
    }
    allArray.forEach(item=>{
        let oneObj=interceptedSales.filter(onj=>onj.type==item)[0]
        if(oneObj){
            const {response,destination,label,objectId,type}=oneObj
            interceptObj.response[type]=response
            interceptObj.destination=destination
            interceptObj.label=label
            interceptObj.objectId=objectId
        }
        
    })
    interceptObj.type='sales'
    // console.log(interceptObj);
    localStorage.setItem('interceptedSales',JSON.stringify([]))
    chrome.runtime.sendMessage({newSalesRecipe:interceptObj})
}

const beginSalesHarvest=async()=>{
    
    await new Promise((resolve, reject) => {
        let times=0
        let mmInt=setInterval(() => {
            times+=1
            console.log('Scrolling');
            window.scrollBy({top:150,behavior:'smooth'})
            if(times>=5){
                clearInterval(mmInt)
                resolve('DONE')
            }
        }, 300);
    })

    await new Promise((resolve, reject) => {
        setTimeout(async() => {
            let insightBtn=await loadSelector("span:contains(Insight)")
            setTimeout(async() => {
                console.log(insightBtn);
                insightBtn.click()
                console.log('clicking');
                resolve('DONE')
            }, 500);
            
        }, 500);
    })
    
    
    // return
    // let employeeButton=await loadSelector('button[data-control-name]')
    // console.log(employeeButton);
    // await new Promise((resolve, reject) => {
    //     setTimeout(() => {
    //         employeeButton.click()
    //         resolve('DONE')
    //     }, 300);
    // })
    
    await sleep(500)
    await new Promise((resolve, reject) => {
        setTimeout(async() => {
            let hiresButton=await loadSelector('button[data-control-name="new_hires_tab"]')
            setTimeout(async() => {
                console.log(hiresButton);
                console.log('clicking');
                hiresButton.click()
                resolve('DONE')
            }, 500);
            
        }, 500);
    })
    
   
    await sleep(500)
    await new Promise((resolve, reject) => {
        setTimeout(async() => {
            let openingsButton=await loadSelector('button[data-control-name="job_openings_tab"]')
            setTimeout(async() => {
                console.log(openingsButton);
                console.log('clicking');
                openingsButton.click()
                resolve('DONE')
            }, 500);
            
        }, 500);
    })
   
    
    await sleep(500)
    await new Promise((resolve, reject) => {
        setTimeout(async() => {
            let personasButton=await loadSelector('button[data-control-name="personas_tab"]')
            setTimeout(async() => {
                console.log(personasButton);
                console.log('clicking');
                personasButton.click()
                resolve('DONE')
            }, 500);
            
        }, 500);
    })
   
    await sleep(500)
    await new Promise((resolve, reject) => {
        setTimeout(async() => {
            let headCountButton=await loadSelector('button[data-control-name="distribution_headcount_tab"]')
            setTimeout(async() => {
                console.log(headCountButton);
                console.log('clicking');
                headCountButton.click()
                resolve('DONE')
            }, 500);
            
        }, 500);
    })
    
    await sleep(500)
    returnInterceptedSales()
    

}

const newCheckIntercept=(url)=>{
    return new Promise((resolve, reject) => {
        let times=0
        let mm=setInterval(() => {
            times+=1
            let allIntercepted=JSON.parse(localStorage.getItem('allIntercepted'))
            let ourObjArr=allIntercepted.filter(item=>item.url==url)
            if(ourObjArr[0]){
                let allIntercepted=JSON.parse(localStorage.getItem('allIntercepted'))
                let remainingArr=allIntercepted.filter(item=>item.url!=url)
                localStorage.setItem('allIntercepted',JSON.stringify(remainingArr))
                let ourObjArr=allIntercepted.filter(item=>item.url==url)
                chrome.runtime.sendMessage({tabIntercepted:ourObjArr[0]}) 
                clearInterval(mm)
            }
            if(times==3){
                clearInterval(mm)
            }
            
            
        }, 650);
        
    })
}

const checkIntercepted=(reset)=>{
    return new Promise((resolve, reject) => {
        let prevInterceptArr=JSON.parse(localStorage.getItem('interceptArr'))
        // chrome.storage.local.set({interceptArr:prevInterceptArr})
        chrome.runtime.sendMessage({interceptedArray:prevInterceptArr})
        if(reset && reset==true){
            localStorage.setItem('interceptArr',JSON.stringify([]))
        }
        resolve('Checked')
    })
}

const checkIntercepted2=()=>{
    let times=0
    
    return
    let ourInterval=setInterval(() => {
        if(times>1){
            clearInterval(ourInterval)
        }
        else{
            times=times+1
            let sentIntercepts=JSON.parse(localStorage.getItem('sentIntercepted'))
            let interceptArr=JSON.parse(localStorage.getItem('interceptArr'))
            if(interceptArr!==null){
                interceptArr=interceptArr.filter(item=>!(sentIntercepts.includes(item.timestamp)))
                
                
            }
            localStorage.setItem("sentIntercepted",JSON.stringify(sentIntercepts))
        }
        
    }, 500);
    
}

const  loadSelector=async(selector,all)=> {
    var found = false;
    var raf;
    let el
    let times=0
    return new Promise((resolve,reject)=>{
        (async function check(){
            // el=document.querySelectorAll(selector)
            el=$(selector)
            times+=1
            
            if (el && el[0]) {
                found = true;
                cancelAnimationFrame(raf);
                all?resolve(el):resolve(el[0])
                
                if(!found){
                raf = requestAnimationFrame(check);
                }
                
            
            } else if(times>=3){
                resolve(null)
            }
            else {
                await sleep(300)
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
let isRunning = false;
const runString=async(action_array,limit)=>{
    isRunning=true
    return new Promise(async(resolve, reject) => {
        for (let i = 0; i < action_array.length; i++) {
            if(action_array[i]=='reset_rules_limit'){
                console.log('Resetting limit');
                chrome.runtime.sendMessage({message:`Resetting tab Limit to ${limit}`})
                localStorage.setItem('interceptedArr',JSON.stringify([]))
            }
            else{
                const itemArr = action_array[i].split(' ')
                // console.log(itemArr);
                if(itemArr.includes('wait')){
                    console.log('Waiting');
                    let length=parseFloat(itemArr[1])
                    // console.log(`Waiting ${length}`);
                    await sleep(length*1000)
                    // console.log('waited')
                }
                else if(itemArr.includes('click')){

                    let target=itemArr[1]
                    let targ=await loadSelector(target)
                    // console.log('clicking', targ);
                    if(targ!=null){
                        setTimeout(()=>{
                            targ.click()
                        },500)
                        
                    }
                    
                    
                }
                else if(itemArr.includes('scroll')){
                    let itemLen=itemArr.length

                    let target
                    let depth
                    if(itemLen===2){
                        target='window'
                        depth=parseInt(itemArr[1])
                    }else{
                        target=itemArr[1]
                        depth=parseInt(itemArr[2])
                    }
                    
                    

                    if(target=='window'){
                        console.log('Scrolling window');
                        setTimeout(()=>{
                            window.scrollBy({top:depth,behavior:'smooth'})
                        },500)
                       
                    }else{
                        let targ=await loadSelector(target)
                        console.log('Scrolling',targ);
                        if(targ!=null){
                            setTimeout(()=>{
                                targ.scrollBy({top:depth,behavior:'smooth'})
                            },500)
                        }
                        
                    }
                    
                }
                else if(itemArr.includes('navigate')){
                    let url=itemArr[1]
                    window.location.href=url
                   
                    
                }
            }
            
            
        }
        isRunning=false
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
                            if(action_array[i]=='reset_rules_limit'){

                            }else{
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
                    }
                })
                
                
                
            }
            console.log(act_ob);
        }
        
    })
}

// chrome.runtime.sendMessage('check my actions')
