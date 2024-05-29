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
    port: 3306,
    database: "employees"
});
con.connect((error) => {
    if (error)
        throw error;
    connected = true;
    console.log("Prisijungta");
});
//Sukuriame http serverį ir paduodame f-ją kuri bus vykdoma kai ateis užklausa
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
    //Jei kažkas atėjo į puslapį su GET metodu į url: localhost:2999/employees, išsiunčiame jam employeeų sąrašą HTML formatu
    if (url == '/employees' && method == 'GET') {
        if (connected) {
            con.query("SELECT * FROM employees ORDER BY name ASC;", (error, result) => {
                if (error)
                    throw error;
                res.setHeader("Content-Type", "text/html; charset=utf-8");
                let rows = "";
                result.forEach((e) => {
                    rows += "<tr>";
                    rows += `<td>${e.name}</td> <td>${e.surname}</td> <td>${e.phone}</td> <td> <a href='/employee/${e.id}' class="btn btn-success">Plačiau</a></td>`;
                    rows += "</tr>";
                });
                let template = fs_1.default.readFileSync('templates/employees.html').toString();
                template = template.replace('{{ employees_table }}', rows);
                res.write(template);
                res.end();
            });
        }
    }
    //Vieno employee atvaizdavimas, kai url = localhost:2999/employee/5
    console.log(url === null || url === void 0 ? void 0 : url.split("/"));
    if ((url === null || url === void 0 ? void 0 : url.split("/")[1]) == 'employee') {
        //Pasiimame iš url id
        let id = parseInt(url === null || url === void 0 ? void 0 : url.split("/")[2]);
        con.query(`SELECT * FROM employees WHERE id=${id};`, (error, result) => {
            if (error)
                throw error;
            let employee = result[0];
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            let template = fs_1.default.readFileSync('templates/employee.html').toString();
            template = template.replace("{{ name }}", employee.name);
            template = template.replace("{{ surname }}", employee.surname);
            template = template.replace("{{ gender }}", employee.sex != null ? employee.sex : '-');
            template = template.replace("{{ phone }}", employee.phone != null ? employee.phone : '-');
            template = template.replace("{{ birthday }}", employee.birthday != null ? employee.birthday.toLocaleDateString() : '-');
            template = template.replace("{{ education }}", employee.education != null ? employee.education : '-');
            template = template.replace("{{ salary }}", employee.salary != null ? employee.salary : '-');
            res.write(template);
            res.end();
        });
    }
});
//Paleidžiame serverį
server.listen(3000, 'localhost');
