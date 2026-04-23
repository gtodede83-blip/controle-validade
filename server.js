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


// 📦 LISTAR PRODUTOS (ordenado por validade)
app.get("/produtos", (req, res) => {
  db.query(
    "SELECT * FROM controle_validade ORDER BY data_validade ASC",
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
});


// 🔎 BUSCAR PRODUTO PELO CÓDIGO (AUTO PREENCHER)
app.get("/produto/:codigo", (req, res) => {
  const codigo = req.params.codigo;

  db.query(
    "SELECT produto, fornecedor FROM controle_validade WHERE codigo = ? LIMIT 1",
    [codigo],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length === 0) {
        return res.json(null);
      }

      res.json(result[0]);
    }
  );
});


// ➕ CADASTRAR (SEM BLOQUEIO, SÓ ALERTA)
app.post("/produto", (req, res) => {
  const d = req.body;

  db.query(
    "SELECT produto FROM controle_validade WHERE codigo = ? LIMIT 1",
    [d.codigo],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json("Erro ao validar código");
      }

      let mensagem = "Salvo com sucesso";

      if (result.length > 0) {
        const produtoSalvo = result[0].produto;

        if (produtoSalvo !== d.produto) {
          mensagem = `⚠️ Código já cadastrado como "${produtoSalvo}"`;
        } else {
          mensagem = "⚠️ Produto já existe (novo lote adicionado)";
        }
      }

      const sql = `
        INSERT INTO controle_validade
        (codigo, produto, fornecedor, quantidade, data_validade, loja, encarregado)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        sql,
        [
          d.codigo,
          d.produto,
          d.fornecedor || null,
          d.quantidade,
          d.data_validade,
          d.loja || null,
          d.encarregado || null
        ],
        (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json("Erro ao salvar no banco");
          }

          res.send(mensagem);
        }
      );
    }
  );
});
// ✅ MARCAR COMO RESOLVIDO
app.put("/produto/:id/resolver", (req, res) => {
  const id = req.params.id;

  db.query(
    "UPDATE controle_validade SET resolvido = 1 WHERE id = ?",
    [id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.send("Produto marcado como sem estoque");
    }
  );
});

// ❌ EXCLUIR
app.delete("/produto/:id", (req, res) => {
  const id = req.params.id;

  db.query(
    "DELETE FROM controle_validade WHERE id = ?",
    [id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.send("Excluído com sucesso");
    }
  );
});


// 🚀 INICIAR
app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
