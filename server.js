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
  db.query("SELECT * FROM controle_validade ORDER BY data_validade ASC", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// ➕ CADASTRAR (COM VALIDAÇÃO)
app.post("/produto", (req, res) => {
  const d = req.body;

  // 🔎 Verifica se já existe esse código
  db.query(
    "SELECT produto FROM controle_validade WHERE codigo = ? LIMIT 1",
    [d.codigo],
    (err, result) => {
      if (err) return res.status(500).json(err);

      // 👉 se já existe código
      if (result.length > 0) {
        const produtoSalvo = result[0].produto;

        // ❌ se nome for diferente → bloqueia
        if (produtoSalvo !== d.produto) {
          return res.status(400).send(
            `Código já cadastrado como "${produtoSalvo}"`
          );
        }
      }
      
if (result.length > 0) {
  const produtoSalvo = result[0].produto;

  if (produtoSalvo !== d.produto) {
    return res.status(400).send(
      `⚠️ Código já pertence ao produto "${produtoSalvo}"`
    );
  }

  // 👉 só informa, mas continua salvando
  console.log("Produto já existente, novo lançamento permitido");
}
      // ✅ não bloqueia por validade → permite salvar
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
