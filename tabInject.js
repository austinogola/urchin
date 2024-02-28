var s = document.createElement('script');
// must be listed in web_accessible_resources in manifest.json
s.src = chrome.runtime.getURL('injected.js');
s.async = true;
s.referrerpolicy='same-origin'

chrome.storage.local.get('tabRules',res=>{
    if(res.tabRules){
        console.log();
        let {tabRules}=res
        localStorage.setItem("tabRules",JSON.stringify(tabRules))
        s.onload = function() {
            this.remove();
        };
        (document.head || document.documentElement).appendChild(s);
    }
})