const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ CONEXÃO CERTA (Railway)
const db = mysql.createPool({
  uri: process.env.MYSQL_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
// 🔍 TESTE SIMPLES
app.get("/", (req, res) => {
  res.send("API funcionando");
});

// 📦 LISTAR PRODUTOS
app.get("/produtos", (req, res) => {
  db.query("SELECT * FROM controle_validade", (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }
    res.json(result);
  });
});

// ➕ CADASTRAR
app.post("/produto", (req, res) => {
  const d = req.body;

  const sql = `
    INSERT INTO controle_validade
    (produto, fornecedor, quantidade, data_validade)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [
    d.produto,
    d.fornecedor,
    d.quantidade,
    d.data_validade
  ], (err) => {
    if (err) return res.status(500).json(err);
    res.send("Salvo com sucesso");
  });
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
