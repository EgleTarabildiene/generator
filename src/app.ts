import http from 'http';


const server=http.createServer((req,res)=>{

 
    const url=req.url;
    console.log(url);

  
    const method=req.method;
    console.log(method);

  
    let daugiklis=0;
    if (url!=null){
       daugiklis=parseInt(url.split("/")[1]);
    }
    

   
    res.setHeader('Content-Type','text/html; charset=utf-8');
   
    res.write("<!DOCTYPE html>");
    res.write("<html>");

    res.write("<head>");
    res.write("<title>Daugybos lentelė</title>");
    res.write("</head>");
    res.write("<body>");

 
        res.write(`<a href="/10">10%</a>&nbsp;&nbsp;`);
        res.write(`<a href="/30">30%</a>&nbsp;&nbsp;`);
        res.write(`<a href="/50">50%</a>&nbsp;&nbsp;`);
   
    res.write("<hr>");
    res.write(`<h1>Daugybos lentelė</h1>`);
    res.write("<table border='1'>");
    




    for (let i=1; i<=10; i++){
        res.write("<tr>");

        for (let y=1; y<=10; y++){
            if (Math.random() < daugiklis / 100){
                res.write("<td></td>");
            }else{
                res.write(`<td>${i*y}</td>`);
            }
        
        }
        res.write("</tr>");
    }

    res.write("</table>");

    res.write("</body>");
    res.write("</html>");
    res.end();

});

server.listen(3000, 'localhost');














