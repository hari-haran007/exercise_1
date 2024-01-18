const express=require('express')
const path = require('path')
const fs=require('fs')
const fsPromises=require('fs').promises
const fileUpload=require('express-fileupload')
const  cheerio  = require('cheerio')
const port=process.env.PORT||3000
const app=express()
const data={
    "capitals":[],
    "summary": {
		"numberOfCapitals": 0
	}
}
app.use(fileUpload())
app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'main.html'))
})
app.post('/upload',(req,res)=>{
     if(!req.files||Object.keys(req.files).length===0)
     return res.status(400).send('No files Found')

     const uploadedFile=req.files.htmlFile;
     const uploadPath=path.join(__dirname,uploadedFile.name)
     uploadedFile.mv(uploadPath,(err)=>{
        if(err) return res.status(500).send(err)

        const htmlContent=fs.readFileSync(uploadPath,'utf-8');
        const $=cheerio.load(htmlContent);

        $('#main>ul>li').each((i,nam)=>{
          
            const a=$(nam).find('.capital').text().trim()

            const b=$(nam).find('.state').text().trim()
            const newData={capital:a,state:b}
            data.capitals.push(newData)

        })
        data.summary.numberOfCapitals=data.capitals.length;

        const jsonFilePath=path.join(__dirname,'json',`${uploadedFile.name}.json`);
       
        fs.writeFileSync(jsonFilePath,JSON.stringify(data,null,2));
        
        res.send('File uploaded and parsed' +'\n\n'+JSON.stringify(data));
     })

})
app.listen(port,()=>{
    console.log("running ")
})