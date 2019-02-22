const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

require('dotenv').config();
const db = require('./config/db')();


const latestVersion = require('latest-version');
const semver = require('semver');
const semverRegex = require('semver-regex');
var semverSort = require('semver-sort');

const mailer = require('express-mailer'); 
const mailConfig = require('./config/mail');
const cron = require('node-schedule');


// models
const repoModel = require('./models/Repository');
const subModel = require('./models/Subscription');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(cors());
// set the view folder to views
app.set('views', __dirname + '/views');
// set the view engine to pug
app.set('view engine', 'pug');

mailer.extend(app,mailConfig );



function checkMail(emails,repo){
    if(emails){
        for(email in emails){
            
            let newSub = new subModel({
                email: emails[email]['value'],
                repository_id:repo.id
            });

            newSub.save(function (err,sub) {
                if (err) throw err;

                // Send email to saved subs

                sendMail(sub,repo);


                });

            }

    }
}

function sendMail(sub,repo){

    var mailOptions = {
        to: sub.email,
        subject: 'Result Email from Atolye15',
        data: repo
      }
     
      // Send email.
      app.mailer.send('email', mailOptions, function (err, message) {
        if (err) {
          console.log(err);  
        }
        console.log("Mail is sended");
        
      });

}

// Every Midnight
cron.scheduleJob('0 0 0 * * *', function(){
    scheduleMail();
});


function scheduleMail(){
  
  subModel.find({},function(err,docs){
     
     docs.forEach(async (element) => {
       repoModel.findOne({_id:element.repository_id},function(e,s){
              sendMail(element,s);
              
         });
         
     });
    });
  
 
}

 async function getPackages(owner,repository,fileName,emails=null){

    const findRepo = await repoModel.findOne({owner,repository});
    
    if(!findRepo){
    try {
            const url = await `https://api.github.com/repos/${owner}/${repository}/contents`

            return await axios.get(`${url}/${fileName}`)
            .then(async (res) => {

               
                return await axios.get(`${res.data.download_url}`).then( async res2 => {
                  

                    const newPackage = [];


                    if(fileName==="package.json"){
                         // --------- NPM -------------
                        for(data in res2.data.dependencies){
                          const latest_version = await latestVersion(data);
                          const currentVersion = semver.valid(semver.coerce(res2.data.dependencies[data]));
                          const upToDate = !semver.lt(currentVersion, latest_version);

                          newPackage.push({name:data,version:currentVersion,latest_version:latest_version,upToDate:upToDate })
                           
                        }
           
                    }else{

                       // --------- COMPOSER -------------
                
                        for(data in res2.data.require){
                                
                                await axios.get(`https://packagist.org/p/${data}.json`).then( async res3 => {
                                const versions = []
                                for(key in res3.data.packages[data]){
                                    if(semverRegex().test(key)){
                                        versions.push(semver.valid(semver.coerce(semverRegex().exec(key)[0])));
                                        
                                    }
                                   
                                }
                                const latest_version = semverSort.desc(versions)[0]    
                                const currentVersion = semver.valid(semver.coerce(res2.data.require[data]));
                                const upToDate = !semver.lt(currentVersion, latest_version);

                                newPackage.push({name:data,version:currentVersion,latest_version:latest_version,upToDate:upToDate })
                           

                            }).catch( e => {
                                console.log("error getting package");
                            });

                    }
                }


                let newRepository =  new repoModel({ 
                    url : res.data.html_url,
                    owner : owner,
                    repository: repository,
                    packages : newPackage ,
                    packageType: fileName,
                    
                    });
                //save model   
                newRepository.save(function (err,repo) {
                    // Check Mails
                    checkMail(emails,repo);
                    console.log(repo);
                    if (err) {
                        throw err;
                        
                    }
                    console.log("inserted to db")
                });

                return newRepository;



         
                }).catch(e => {
                    throw e;
                    
                })
            
            
            }).catch(e => {
    
                return null;
                
            });

    } catch (e) {     
        console.log(e);
        
    }
    }else{
        console.log(findRepo.id);
        checkMail(emails,findRepo);

        return findRepo;

    }
}

// ------- Routes --------
app.post('/notify', async (req, res) => {
    try {
        const { owner , repository} = req.body.data.repository;
        

        
         var getPackage = await  getPackages(owner,repository,"composer.json",req.body.data.emails);


         if(getPackage == null) getPackage =  await getPackages(owner,repository,"package.json",req.body.data.emails);
        
         await (getPackage == null) ? res.json({ success : false }) :  res.json({ success: true})
        
         
      
       
    } catch (err) {
        console.error(err);
    }
    
})

app.get('/', (req, res) => {
  
    
})

// For Single Page
app.get('/list/:owner/:repository', async function (req, res) {

    const { owner , repository} = req.params;
     var getPackage = await  getPackages(owner,repository,"composer.json");


     if(getPackage == null) getPackage =  await getPackages(owner,repository,"package.json");
    
    
    
    res.send(getPackage);
  });

  // Re-check repo
  app.get('/recheck/:id', async function (req, res) {

    const { id } = req.params;

    const currentRepo = await repoModel.findOne({ _id: id });
    
    repoModel.deleteOne({ _id: id }, function (err, results) {
    });



   var newRepo = null;
   await axios.get(`http://localhost:4000/list/${currentRepo.owner}/${currentRepo.repository}`).then( async res => {
        newRepo = await res.data;
        

        //Update old subs with new Repos
         subModel.update({repository_id:currentRepo._id },{repository_id: newRepo._id},{multi: true}, function(err, res) {
           
            
          });

   }

   );

   
    
    res.send(newRepo);
  });


  
app.listen({port:4000}, () => {
    console.log('Server is running');
})