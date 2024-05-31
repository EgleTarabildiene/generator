"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql2_1 = __importDefault(require("mysql2"));
const http_1 = __importDefault(require("http"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
let connected = false;
const con = mysql2_1.default.createConnection({
    host: "localhost",
    user: "root",
    password: "LabasRytas",
    database: "company"
});
con.connect((error) => {
    if (error)
        throw error;
    connected = true;
    console.log("Prisijungta");
});
const server = http_1.default.createServer((req, res) => {
    const url = req.url;
    const method = req.method;
    let filePath = `public${url}`;
    if (fs_1.default.existsSync(filePath) && fs_1.default.lstatSync(filePath).isFile()) {
        const ext = path_1.default.extname(filePath);
        switch (ext) {
            case ".css":
                res.setHeader("Content-Type", "text/css; charset=utf-8");
                break;
            case ".js":
                res.setHeader("Content-Type", "application/javascript; charset=utf-8");
                break;
            case ".jpg":
            case ".png":
            case ".jpeg":
                res.setHeader("Content-Type", "image/jpg; charset=utf-8");
                break;
        }
        let file = fs_1.default.readFileSync(filePath);
        res.write(file);
        return res.end();
    }
    if (url == '/employees' && method == 'GET') {
        if (connected) {
            con.query("SELECT * FROM employees ORDER BY name ASC;", (error, result) => {
                if (error)
                    throw error;
                res.setHeader("Content-Type", "text/html; charset=utf-8");
                let rows = "";
                result.forEach((e) => {
                    rows += "<tr>";
                    rows += `<td>${e.name}</td> <td>${e.surname}</td> <td>${e.phone}</td> <td> <a href='/employee/${e.id}' class="btn btn-success">Plačiau</a> <a href='/delete/${e.id}' class="btn btn-danger">Ištrinti</a></td>`;
                    rows += "</tr>";
                });
                let template = fs_1.default.readFileSync('templates/employees.html').toString();
                template = template.replace('{{ employees_table }}', rows);
                res.write(template);
                res.end();
            });
        }
    }
    if (url == '/add' && method == 'POST') {
        if (connected) {
            const reqBody = [];
            req.on('data', (d) => {
                reqBody.push(d);
            });
            req.on('end', () => {
                const reqData = decodeURIComponent(Buffer.concat(reqBody).toString());
                const dd = reqData.split('&');
                console.log(dd);
                const name = mysql2_1.default.escape(dd[0].split('=')[1]);
                const surname = mysql2_1.default.escape(dd[1].split('=')[1]);
                const gender = mysql2_1.default.escape(dd[2].split('=')[1]);
                const phone = mysql2_1.default.escape(dd[3].split('=')[1]);
                const birthday = mysql2_1.default.escape(dd[4].split('=')[1]);
                const education = mysql2_1.default.escape(dd[5].split('=')[1]);
                const salary = mysql2_1.default.escape(dd[6].split('=')[1]);
                const sql = `INSERT INTO employees(name, surname, gender, phone, birthday, education, salary) VALUES (${name}, ${surname}, ${gender}, ${phone}, ${birthday}, ${education},${salary})`;
                con.query(sql, (error) => {
                    if (error)
                        throw error;
                });
                res.writeHead(302, {
                    'Location': '/employees'
                });
                res.end();
            });
        }
    }
    if (url == '/add' && method == 'GET') {
        if (connected) {
            let template = fs_1.default.readFileSync('templates/add.html').toString();
            res.write(template);
            res.end();
        }
    }
    console.log(url === null || url === void 0 ? void 0 : url.split("/"));
    if ((url === null || url === void 0 ? void 0 : url.split("/")[1]) == 'employee') {
        let id = parseInt(url === null || url === void 0 ? void 0 : url.split("/")[2]);
        con.query(`SELECT * FROM employees WHERE id=${id};`, (error, result) => {
            if (error)
                throw error;
            let employee = result[0];
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            let template = fs_1.default.readFileSync('templates/employee.html').toString();
            template = template.replace("{{ name }}", employee.name);
            template = template.replace("{{ surname }}", employee.surname);
            template = template.replace("{{ gender }}", employee.gender != null ? employee.gender : '-');
            template = template.replace("{{ phone }}", employee.phone != null ? employee.phone : '-');
            template = template.replace("{{ birthday }}", employee.birthday != null ? employee.birthday.toLocaleDateString() : '-');
            template = template.replace("{{ education }}", employee.education != null ? employee.education : '-');
            template = template.replace("{{ salary }}", employee.salary != null ? employee.salary : '-');
            res.write(template);
            res.end();
        });
    }
    if ((url === null || url === void 0 ? void 0 : url.split("/")[1]) == 'delete') {
        //Pasiimame iš url id
        let id = parseInt(url === null || url === void 0 ? void 0 : url.split("/")[2]);
        con.query(`DELETE FROM employees WHERE id=${id};`, (error, result) => {
            if (error)
                throw error;
            res.writeHead(302, {
                'Location': '/employees'
            });
            res.end();
        });
    }
});
//Paleidžiame serverį
server.listen(3000, 'localhost');
