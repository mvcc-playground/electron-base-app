# Armazenamento local do LibSQL

As alteracoes no projeto agora assumem uso apenas local do LibSQL:

- O nome do arquivo e lido da variavel `DATABASE_NAME` (padrao `app.db`).
- O processo principal converte esse nome em um caminho dentro de `app.getPath("userData")` e compartilha via `process.env.DATABASE_FILE` antes de carregar o restante da aplicacao.
- Em execucoes fora do Electron (scripts de migracao, testes), o caminho cai para o diretorio atual.
- A pasta e criada automaticamente, evitando falhas quando o diretorio ainda nao existe.
- Para arquivos locais, o cliente aplica `PRAGMA journal_mode=WAL`, `PRAGMA synchronous=FULL` e `PRAGMA busy_timeout=5000` logo apos a inicializacao.

O processo principal executa `runMigrations()` durante o evento `ready`, aplicando automaticamente novas migrations antes da interface ser aberta.
