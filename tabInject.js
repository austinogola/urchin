var s = document.createElement('script');
// must be listed in web_accessible_resources in manifest.json
s.src = chrome.runtime.getURL('injected.js');
s.async = true;
s.referrerpolicy='same-origin'

chrome.storage.local.get('tabRuleObj',res=>{
    if(res.tabRuleObj){
        console.log();
        let {tabRuleObj}=res
        localStorage.setItem("tabRuleObj",JSON.stringify(tabRuleObj))
        localStorage.setItem("interceptArr",JSON.stringify([]))
        localStorage.setItem("sentIntercepted",JSON.stringify([]))
        
        s.onload = function() {
            this.remove();
        };
        (document.head || document.documentElement).appendChild(s);
    }
})