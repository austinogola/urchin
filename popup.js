const tablinks=document.querySelectorAll('.tablinks')
const tabcontents = document.querySelectorAll(".tabContent");
let labels=document.querySelectorAll('label')
let inputs=document.querySelectorAll('input')

let active_tab=localStorage.getItem('active_tab')

const form=document.querySelector('form')
const txt_label=document.querySelector('#text_label')
const user_id_label=document.querySelector('#user_id_label')
const txt_input=document.querySelector('#text_field')
const user_id_input=document.querySelector('#userId_field')

const resetBtn=document.querySelector('#resetBtn')

const statusDiv=document.querySelector('#statusDiv')
const powerBtn=document.querySelector('#powerBtn')
const powerBtn2=document.querySelector('#powerBtn2')
const flip=document.querySelector('.flip')
const flip2=document.querySelector('.flip2')

let STATE
const turnOn=async()=>{
    const sp=document.querySelector('.flip span')
    sp.classList.add('active')
    STATE='ON'
    chrome.storage.local.set({state:"ON"})
    chrome.runtime.sendMessage({state: 'ON'})
    // await sleep(200)
}

const turnOff=async()=>{
    const sp=document.querySelector('.flip span')
    sp.classList.remove('active')
    STATE='OFF'
    chrome.storage.local.set({state:'OFF'})
    chrome.runtime.sendMessage({state: 'OFF'})
    
}

flip.addEventListener('click',e=>{
    document.querySelector('.flip span').style.transition='all .3s'
    const sp=document.querySelector('.flip span')
    if(sp.classList.contains('active')){
        turnOff()
    }
    else{
        turnOn()

    }
})
let AUTOS
const autosOff=()=>{
    const sp=document.querySelector('.flip2 span') 
    sp.classList.remove('active')
    chrome.storage.local.set({autos:'OFF'})
    AUTOS='OFF'
    chrome.runtime.sendMessage({autos: 'OFF'})
}

const autosOn=()=>{
    const sp=document.querySelector('.flip2 span') 
    sp.classList.add('active')
    chrome.storage.local.set({autos:'ON'})
    AUTOS='ON'
    chrome.runtime.sendMessage({autos: 'ON'})
}

flip2.addEventListener('click',e=>{
    document.querySelector('.flip2 span').style.transition='all .3s'
    const sp=document.querySelector('.flip2 span')
    if(sp.classList.contains('active')){
        autosOff()
    }
    else{
        autosOn()
    }
})


resetBtn.addEventListener("click",e=>{
    e.preventDefault()
    localStorage.removeItem('localUser_text');
    form.querySelector('#text_field').placeholder=''
    form.querySelector('#text_field').value=''
    document.querySelector('#text_label').classList.remove('active')
    chrome.runtime.sendMessage({setTask:'REMOVED'})

    // checkFields()
})

form.addEventListener('submit',e=>{
    e.preventDefault()

    if(user_id_input.value!==''){
        // user_id_label.innerText=`User ID : (${user_id_input.value})`
        user_id_label.innerText=`User ID`
        user_id_label.classList.add('active')
        form.querySelector('#userId_field').placeholder=user_id_input.value

        localStorage.setItem('localUser_ID',user_id_input.value)
        chrome.storage.local.set({userId:user_id_input.value})
        chrome.runtime.sendMessage({setId:user_id_input.value,reload:true})
    }

    if(txt_input.value!==''){
        // txt_label.innerText=`Task : (${txt_input.value})`
        txt_label.innerText=`Task`
        txt_label.classList.add('active')
        form.querySelector('#text_field').placeholder=txt_input.value

        localStorage.setItem('localUser_text',txt_input.value)
        chrome.runtime.sendMessage({setTask:txt_input.value})
    }

    user_id_input.value=''
    txt_input.value=''

})

const checkFields=async()=>{
    const stored_userId=localStorage.getItem('localUser_ID')
    const stored_text=localStorage.getItem('localUser_text')

    const status=await chrome.storage.local.get(['state','autos'])
    const state=status.state
    const autos=status.autos

    if(state){
        STATE=state
        document.querySelector('.flip span').style.transition='all .1s'
        state=='OFF'?turnOff():turnOn()
    }
   
    if(autos){
        AUTOS=autos
        document.querySelector('.flip2 span').style.transition='all .1s'
        autos=='ON'?autosOn():autosOff()
    }


    if(stored_userId){
        user_id_label.innerText=`User ID`
        user_id_label.classList.add('active')
        document.querySelector('#userId_field').placeholder=stored_userId
    }
    else{
        user_id_label.classList.remove('active')
    }

    if(stored_text){
        taskId=stored_text
        txt_label.innerText=`Task`
        txt_label.classList.add('active')

        document.querySelector('#text_field').placeholder=stored_text
    }
    else{
        // txt_label.classList.remove('active')  
    }
}

checkFields()


labels.forEach(label=>{
    label.addEventListener('click',e=>{
        let targ=e.target.parentElement
        let inp=targ.querySelector('input')
        inp.focus()
    })
})

inputs.forEach(iput=>{
    iput.addEventListener('focus',e=>{
        let targ=e.target.parentElement
        let label=targ.querySelector('label')
        label.classList.add('active')
        e.target.placeholder=''
        // iput.placeholder=''
        // checkFields()
    })
    iput.addEventListener('blur',e=>{
        let targ=e.target.parentElement
        let label=targ.querySelector('label')

        if(iput.value.length>=1){

        }
        else{
            label.classList.remove('active')
            e.target.placeholder=''
            checkFields()
        }
        // 
        
    })
})

if(active_tab){
    tablinks.forEach(item=>{
        item.classList.remove('active')
        if(item.innerHTML.toLocaleLowerCase()==active_tab){
            item.classList.add('active')
        }
    })
    tabcontents.forEach(item=>{
        item.classList.remove('active')
        if(item.id.toLocaleLowerCase()==active_tab){
            item.classList.add('active')
        }
    })

    if(active_tab=='schedules' || active_tab=='actions'){
        // const statusDiv=document.querySelector('#statusDiv')
        // statusDiv.style.display='none'
        // fetchAndSet(active_tab)
    }
    else if(active_tab=='autos'){
        // fetchAndSet(active_tab)
    }
    else{
        // const statusDiv=document.querySelector('#statusDiv')
        // statusDiv.style.display='block'
    }
    
}

tablinks.forEach(item=>{
    item.addEventListener('click',e=>{
        tablinks.forEach(item=>{
            item.classList.remove('active')
        })

        e.target.classList.add('active')

        let idn=e.target.innerHTML.toLowerCase()

        tabcontents.forEach(item=>{
            item.style.display='none'
            if(item.id==idn){
                item.style.display='block'
                localStorage.setItem('active_tab',idn)
            }
        })

        if(idn=='schedules' || idn=='actions'){
            const statusDiv=document.querySelector('#statusDiv')
            statusDiv.style.display='none'

            // fetchAndSet(idn)
        }
        else{
            const statusDiv=document.querySelector('#statusDiv')
            statusDiv.style.display='block'
        }

    })
})