Install Express in Linux
--------------------
1. cd to ur directory
2. sudo apt install npm (if you do not have npm)
3. npm init
4. npm install express --save


Run a .js file
--------------------
1. In terminal, run: node <src code>.js
OR
2a. Go in package.json
2b. In scripts section you can add the following:   
    "<script name>" : "node <src code>.js"
2c. In terminal, run: npm run <script name>


Installing + using EJS
--------------------
Motivation: want to depict html files for ur user
1. create folder in directory called "views"
2. npm install ejs --save
3. BONUS :D - install ejs syntax highlighting on vscode


Installing + using PostgreSQL
--------------------
Motivation: we got to use the db. Project requirment
1. Install postgres package: npm install pg --save
2. Install dotenv: npm install dotenv --save


