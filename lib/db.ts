// lib/db.ts
import Database from '@tauri-apps/plugin-sql';

export interface LocalizacaoSQLite {
  id?: number;
  latitude: number;
  longitude: number;
  timestamp: number;
  sincronizado: number; // No SQLite usamos 0 ou 1 (não há tipo booleano nativo)
}

class SqliteManager {
  private dbInstance: Database | null = null;

  // Inicializa o banco de dados e cria a tabela se ela não existir
  async getDb(): Promise<Database> {
    if (this.dbInstance) return this.dbInstance;

    // Cria/abre o arquivo raijmobi.db no armazenamento nativo e seguro do SO
    this.dbInstance = await Database.load('sqlite:raijmobi.db');

    // Executa a query para criar a tabela de histórico de GPS
    await this.dbInstance.execute(`
      CREATE TABLE IF NOT EXISTS historico_gps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        timestamp INTEGER NOT NULL,
        sincronizado INTEGER DEFAULT 0
      );
    `);

    return this.dbInstance;
  }

  // Comandos Práticos e Tipados para facilitar o uso nos componentes

  // 1. Inserir localização
  async adicionarLocalizacao(lat: number, lng: number): Promise<void> {
    const db = await this.getDb();
    await db.execute(
      'INSERT INTO historico_gps (latitude, longitude, timestamp, sincronizado) VALUES ($1, $2, $3, $4)',
      [lat, lng, Date.now(), 0]
    );
  }

  // 2. Buscar o que está pendente de envio para o servidor
  async buscarPendentes(): Promise<LocalizacaoSQLite[]> {
    const db = await this.getDb();
    // select retorna um array de objetos correspondente às linhas da tabela
    return await db.select<LocalizacaoSQLite[]>(
      'SELECT * FROM historico_gps WHERE sincronizado = 0'
    );
  }

  // 3. Deletar os registros locais após o servidor confirmar o recebimento
  async deletarRegistros(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    const db = await this.getDb();
    // Transforma o array [1, 2, 3] em uma string "1,2,3" para a query SQL
    const idsString = ids.join(',');
    await db.execute(`DELETE FROM historico_gps WHERE id IN (${idsString})`);
  }
}

// Exporta uma instância única (Singleton) para o Next.js usar em qualquer tela
export const tauriDb = new SqliteManager();