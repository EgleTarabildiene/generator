
import http from 'http';
import fs from 'fs';


const server=http.createServer((req,res)=>{
    const method=req.method;
    const url=req.url;
    console.log(`Metodas: ${method}, URL: ${url}`);

    if (url=='/calculate' && method=='POST'){
       
        const reqBody:any[]=[];
       
        req.on('data', (d)=>{
            console.log(`Gaunami duomenys`);
            console.log(`Duomenys: ${d}`);
            reqBody.push(d);
        });


     
        req.on('end',()=>{
            console.log(`Baigti siųsti duomenys`);
         
            const reqData=Buffer.concat(reqBody).toString();
            const va=reqData.split('&');
            const x=parseFloat(va[0].split('=')[1]);
           
            console.log(`Visi gauti duomenys: ${reqData}`);
            console.log(va);

            res.setHeader("Content-Type", "text/html; charset=utf-8");
         
            let template=fs.readFileSync('templates/result.html').toString();
      
            template=template.replace('{{ result }}',`Rezultatas: ${x*2.54}`);
            res.write(template);
            res.end();
        });
        return;
    }

    if (url=='/'){
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        const template = fs.readFileSync('templates/index.html');
        res.write(template);
        return res.end();
    }


    res.writeHead(404, {
        "Content-Type":"text/html; charset=utf-8"
    });
   

    const template=fs.readFileSync('templates/404.html');
    res.write(template);
    return res.end();



    
    
});

server.listen(3000, 'localhost');














