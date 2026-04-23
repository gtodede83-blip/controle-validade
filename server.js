const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ CONEXÃO
const db = mysql.createPool({
  uri: process.env.MYSQL_URL,
  ssl: { rejectUnauthorized: false }
});

// 🔍 TESTE
app.get("/", (req, res) => {
  res.send("API funcionando");
});

// 📦 LISTAR PRODUTOS
app.get("/produtos", (req, res) => {
  db.query("SELECT * FROM controle_validade", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// ➕ CADASTRAR (COM VALIDAÇÃO)
app.post("/produto", (req, res) => {
  const d = req.body;

  db.query(
    "SELECT produto FROM controle_validade WHERE codigo = ? LIMIT 1",
    [d.codigo],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length > 0) {
        const produtoSalvo = result[0].produto;

        if (produtoSalvo !== d.produto) {
          return res.status(400).send(
            `Esse código já pertence ao produto "${produtoSalvo}"`
          );
        }
      }

      const sql = `
        INSERT INTO controle_validade
        (codigo, produto, fornecedor, quantidade, data_validade)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(sql, [
        d.codigo,
        d.produto,
        d.fornecedor,
        d.quantidade,
        d.data_validade
      ], (err) => {
        if (err) return res.status(500).json(err);
        res.send("Salvo com sucesso");
      });
    }
  );
});

// ❌ EXCLUIR
app.delete("/produto/:id", (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM controle_validade WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json(err);
    res.send("Excluído");
  });
});

// 🚀 INICIAR
app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
