const getAutos=(test)=>{
    return new Promise(async(resolve,reject)=>{
            let autosUri
            if(test){
                autosUri=`https://eu-api.backendless.com/F1907ACC-D32B-5EA1-FFA2-16B5AC9AC700/E7D47F5F-7E77-4E8D-B6CE-E2E7A9C6C1C2/data/auto?pageSize=${5}&where=userID%3D'${'test'}'`

            }else{
                autosUri=`https://eu-api.backendless.com/F1907ACC-D32B-5EA1-FFA2-16B5AC9AC700/E7D47F5F-7E77-4E8D-B6CE-E2E7A9C6C1C2/data/auto?pageSize=${AUTOS_SIZE}&where=userID%3D'${userId}'%20AND%20complete%20%3D%20false&sortBy=%60created%60%20desc`
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

const setAutos=()=>{
    return new Promise(async(resolve, reject) => {
        let autosArr=await getAutos()
        console.log(autosArr);
    })
}