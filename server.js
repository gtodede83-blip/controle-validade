const express = require("express");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 CONEXÃO POSTGRES (RENDER)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ✅ SERVIR HTML
app.use(express.static(__dirname));

// ✅ ROTA PRINCIPAL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ✅ TESTE API
app.get("/api", (req, res) => {
  res.send("API Controle de Visitas OK");
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

// 🚀 PORTA DO RENDER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});
