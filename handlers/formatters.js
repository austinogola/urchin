
const formatCompany=(companyArr)=>{
    return new Promise((resolve, reject) => {
        let finalObj={}
        
        let label2,destination2,objectId2
        companyArr.forEach(dt=>{

            const {type,label,destination,objectId}=dt
            label2=label
            destination2=destination
            objectId2=objectId
            if(type=='updates'){
                let updObj=JSON.parse(dt.response)
                finalObj.updates=formatCompanyUpdates(updObj)
            }
            else if(type=='main'){
                let mainObj=JSON.parse(dt.response)
                finalObj={...finalObj,...formatCompanyMain(mainObj)}
                finalObj.company_id=dt.profile
            }
        })

        console.log(finalObj);
        sendFormatted(finalObj,destination2,{label:label2,objectId:objectId2})
        updateRecipe(objectId2)

        resolve(finalObj);
    })
}

const formatCompanyUpdates=(updateObj)=>{
    const {elements}=updateObj
    let updatesArr=[]
    elements.forEach(item=>{
        const {permalink,isSponsored}=item
        updatesArr.push({link:permalink,isSponsored})
    })

    return(updatesArr)

}

const formatCompanyMain=(mainObj)=>{
    const {elements}=mainObj
    const {
        affiliatedCompanies, affiliatedCompaniesWithEmployeesRollup,affiliatedCompaniesWithJobsRollup,
        backgroundCoverImage,companyEmployeesSearchPageUrl,companyIndustries,companyPageUrl,companyType,
        confirmedLocations,coverPhoto,name,dashEntityUrn,description,entityUrn,followingInfo,foundedOn,
        fundingData,groups,headquarter,jobSearchPageUrl,logo,phone,salesNavigatorCompanyUrl,
        specialities,staffCount,staffCountRange,tagline,url,universalName
    }=elements[0]

    const finalMainObj={
        name,
        universal_name:universalName,tagline,
        entityUrn,description,
        phone:phone?phone.number:null,
        followers:followingInfo?followingInfo.followerCount:null,
        company_site:companyPageUrl,
        headquarter,specialities,
        company_industries:companyIndustries?companyIndustries.map(item=>item.localizedName):null,
        founded:foundedOn,type:companyType.localizedName,
        staff:{total:staffCount,range:staffCountRange},
        locations:confirmedLocations,
        funding_data:fundingData

    }

    return finalMainObj

}

const formatProfile=(profileArr)=>{
    return new Promise((resolve, reject) => {
        let finalObj={}
        let label2,destination2,objectId2
        profileArr.forEach(dt=>{
           
            const {type,label,destination,objectId}=dt
            label2=label
            destination2=destination
            objectId2=objectId
            
            if(type=='privacy'){
                finalObj.privacy=formatPrivacy(dt)
            }
            else if(type=='contacts'){
                finalObj.contact_info=formatContacts(dt)
            }
            else if(type=='network'){
                finalObj.network_info=formatNetwork(dt)
            }
            else if(type=='badges'){
                const {influencer,premium,jobSeeker}=formatBadges(dt)
                finalObj={...finalObj,influencer,premium,jobSeeker}
            }
            else if(type=='positions'){
                finalObj.positions=formatPositions(dt)
            }
            else if(type=='main'){
                finalObj={...formatMain(dt)}
                finalObj.profile_id=dt.profile
            }
            else if(type=='updates'){
                finalObj.updates=formatUpdates(dt)
            }
        })
        console.log(finalObj);
        sendFormatted(finalObj,destination2,{label:label2,objectId:objectId2})
        updateRecipe(objectId2)
        resolve(finalObj);
    })
}

const formatPrivacy=(privString)=>{
    // console.log(privString);
    let privacyObj=JSON.parse(privString.response)

    return(privacyObj)
}



const formatContacts=(contactString)=>{
    let contactObj=JSON.parse(contactString.response)
    const {websites,twitterHandles,email}=contactObj
    return({websites:websites,twitterHandles,email})
}

const formatNetwork=(netString)=>{
    let networkObj=JSON.parse(netString.response)
    const {followersCount,connectionsCount,followable}=networkObj
    return({followersCount,connectionsCount,followable})
}

const formatBadges=(badgeString)=>{
    let badgObj=JSON.parse(badgeString.response)
    const {influencer,premium,jobSeeker}=badgObj

    return({influencer,premium,jobSeeker})
}

const formatPositions=(privString)=>{
    let privacyObj=JSON.parse(privString.response)

    return(privacyObj)
}

const formatSchools=(eduView)=>{
    const {elements}=eduView
    const eduArray=[]
    elements.forEach(item=>{
        const {degreeName,fieldOfStudy,school,timePeriod}=item
       
        const {schoolName,logo,active}=school || {}
        
        const {rootUrl}=logo?logo['com.linkedin.common.VectorImage'] || {}: {}
        const schoolObj={name:schoolName,logo:rootUrl,active}
        const {endDate,startDate}=timePeriod || {}

        const eduObj={degree_name:degreeName,field_of_study:fieldOfStudy,
            date:{start:startDate,end:endDate},school:schoolObj}
            
            eduArray.push(eduObj)
    })

    return eduArray
}

const formatSkills=(sklView)=>{
    const {elements}=sklView
    const skillArr=[]
    elements.forEach(item=>{
        skillArr.push(item.name)
    })
    return(skillArr)
}
const formatPositionGroups=(posGrpView)=>{
    const {elements}=posGrpView
    const positionsArr=[]
    elements.forEach(item=>{
        const {miniCompany,timePeriod,positions}=item
        const {name,logo,active,objectUrn}=miniCompany || {}
        const {rootUrl}=logo?logo['com.linkedin.common.VectorImage'] || {}:{}
        const company={name,active,objectUrn,logo:rootUrl}

        const {endDate,startDate}=timePeriod || {}
        const date={start:startDate,end:endDate}

        const miniPosArr=[]
        positions.forEach(item=>{
            const {title,timePeriod,company}=item
            const {endDate,startDate}=timePeriod || {}
            const date={start:startDate,end:endDate}

            const miniPosObj={title,date}
            miniPosArr.push(miniPosObj)

        })

        positionsArr.push({company,date,profile_positions:miniPosArr})
    })

    return positionsArr
}
const formatMain=(privString)=>{
    let mainObj=JSON.parse(privString.response)
    // console.log(mainObj);
    const {certificationView,courseView,educationView,profile,
        skillView,positionGroupView,entityUrn}=mainObj
    const {firstName,lastName,headline,industryName,geoLocationName,geoCountryName,summary}=profile
    
    const finalMainObj={
        first_name:firstName,last_name:lastName,headline,
        summary,location:{country:geoCountryName,area:geoLocationName},
        industry:industryName,
        educaton:formatSchools(educationView),
        skills:formatSkills(skillView),
        positions:formatPositionGroups(positionGroupView)
    }

    return(finalMainObj)
}

const formatUpdates=(updateString)=>{
    let updateObj=JSON.parse(updateString.response)
    const {elements} =updateObj
    const allUpdates=[]
    // console.log(elements);
    elements.forEach(item=>{
        const {permalink,isSponsored,id,value}=item
        const actualValues=Object.values(value)[0]
        const {actor,socialDetail,commentary,content}=actualValues || {}
        const {description,name,image,navigationContext}=actor || {}
        const {attributes}=name || {}
        const {actionTarget}=navigationContext || {}
        const poster={name:name.text,description:description.text,profile_url:actionTarget}
        const link=permalink
        allUpdates.push({poster,link,isSponsored})


    })

    return(allUpdates)
}

const sendFormatted=(ftData,url,params)=>{
    // const cacheUrl=`http://localhost:3005/cache/${type}`
    
    let otherParams=new URLSearchParams(params)
    try {

        fetch(url+"?"+otherParams,{
            method:'POST',
            headers:{
                "Content-Type":'application/json'
            },
            body:JSON.stringify(ftData)
        })
        .then(res=>{
            if(res.status==200){
                console.log('Recipe sent');
            }else{
                console.log('Recipe not sent successfully');
            }
            // console.log(res);
        })
        .catch(err=>{
            console.log('Recipe not sent successfully',err.message);
        })
        
    } catch (error) {
        
    }
    

  }