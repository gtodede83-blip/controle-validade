const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 CONEXÃO POSTGRES (Render)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ✅ SERVIR HTML
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ✅ TESTE
const path = require("path");

app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ✅ CRIAR TABELAS
app.get("/criar-tabelas", async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lojas (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100)
      );

      CREATE TABLE IF NOT EXISTS encarregados (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100)
      );

      CREATE TABLE IF NOT EXISTS visitas (
        id SERIAL PRIMARY KEY,
        data DATE,
        loja_id INT REFERENCES lojas(id),
        encarregado_id INT REFERENCES encarregados(id),
        observacao TEXT
      );
    `);

    res.send("Tabelas criadas com sucesso!");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ✅ CADASTRAR VISITA
app.post("/visitas", async (req, res) => {
  const { data, loja_id, encarregado_id, observacao } = req.body;

  try {
    await pool.query(
      "INSERT INTO visitas (data, loja_id, encarregado_id, observacao) VALUES ($1, $2, $3, $4)",
      [data, loja_id, encarregado_id, observacao]
    );

    res.send("Visita salva!");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ✅ LISTAR VISITAS
app.get("/visitas", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT v.*, l.nome AS loja, e.nome AS encarregado
      FROM visitas v
      LEFT JOIN lojas l ON v.loja_id = l.id
      LEFT JOIN encarregados e ON v.encarregado_id = e.id
      ORDER BY v.id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 🚀 PORTA CORRETA PARA RENDER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});
