const sql = require('mssql');

// Configuração da conexão com SQL Server
const config = {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'GestorFinancas',
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true', // Use true para Azure
    trustServerCertificate: true, // Use true para desenvolvimento local
    enableArithAbort: true,
    requestTimeout: 30000,
    connectionTimeout: 30000
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Configurar autenticação
if (process.env.DB_TRUSTED_CONNECTION === 'true') {
  // Windows Authentication
  config.authentication = {
    type: 'ntlm',
    options: {
      domain: process.env.DB_DOMAIN || '',
      userName: process.env.DB_USER || '',
      password: process.env.DB_PASSWORD || ''
    }
  };
} else {
  // SQL Server Authentication
  config.user = process.env.DB_USER;
  config.password = process.env.DB_PASSWORD;
}

// Pool de conexões global
let pool;

/**
 * Conectar ao SQL Server
 */
const connectDB = async () => {
  try {
    if (pool) {
      return pool;
    }

    console.log('🔌 Conectando ao SQL Server...');
    pool = await sql.connect(config);
    console.log('✅ Conectado ao SQL Server com sucesso!');
    
    return pool;
  } catch (error) {
    console.error('❌ Erro ao conectar com SQL Server:', error.message);
    throw error;
  }
};

/**
 * Fechar conexão
 */
const closeDB = async () => {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      console.log('✅ Conexão com SQL Server fechada.');
    }
  } catch (error) {
    console.error('❌ Erro ao fechar conexão:', error.message);
  }
};

/**
 * Obter pool de conexões
 */
const getPool = () => {
  if (!pool) {
    throw new Error('Pool não inicializado. Chame connectDB() primeiro.');
  }
  return pool;
};

/**
 * Executar query com tratamento de erro
 */
const executeQuery = async (query, params = {}) => {
  try {
    const pool = getPool();
    const request = pool.request();
    
    // Adicionar parâmetros
    Object.keys(params).forEach(key => {
      request.input(key, params[key]);
    });
    
    const result = await request.query(query);
    return result;
  } catch (error) {
    console.error('❌ Erro ao executar query:', error.message);
    throw error;
  }
};

/**
 * Executar stored procedure
 */
const executeStoredProcedure = async (procedureName, params = {}) => {
  try {
    const pool = getPool();
    const request = pool.request();
    
    // Adicionar parâmetros
    Object.keys(params).forEach(key => {
      request.input(key, params[key]);
    });
    
    const result = await request.execute(procedureName);
    return result;
  } catch (error) {
    console.error('❌ Erro ao executar procedure:', error.message);
    throw error;
  }
};

/**
 * Verificar saúde da conexão
 */
const checkHealth = async () => {
  try {
    const result = await executeQuery('SELECT 1 as status');
    return result.recordset[0].status === 1;
  } catch (error) {
    return false;
  }
};

module.exports = {
  sql,
  connectDB,
  closeDB,
  getPool,
  executeQuery,
  executeStoredProcedure,
  checkHealth,
  config
};