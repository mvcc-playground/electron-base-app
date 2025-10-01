# Armazenamento local do LibSQL

As alteracoes no projeto garantem que o banco LibSQL seja armazenado de forma segura em producao:

- O arquivo e resolvido a partir da variavel `LIBSQL_FILE`. Se nao estiver definida, o caminho padrao passa a ser `db/app.db` em producao e `dev.db` em desenvolvimento.
- Quando `LIBSQL_FILE` nao contem `://`, ela e interpretada como caminho local (relativo ao `process.cwd()` ou absoluto). URLs `libsql://` continuam funcionando como conexao remota.
- A pasta e criada automaticamente, evitando falhas quando o diretorio ainda nao existe.
- Para arquivos locais, o cliente aplica `PRAGMA journal_mode=WAL`, `PRAGMA synchronous=FULL` e `PRAGMA busy_timeout=5000` logo apos a inicializacao.

Para sobrescrever o local padrao em producao, defina `LIBSQL_FILE` com um caminho absoluto ou uma URL `file:` antes de iniciar o aplicativo (ex.: `LIBSQL_FILE=/var/lib/minha-app.db`).

Em ambientes Electron, uma boa pratica e apontar para `app.getPath("userData")` antes de criar o `BrowserWindow`:

```ts
import path from "node:path";
import { app } from "electron";

app.once("ready", () => {
  process.env.LIBSQL_FILE ??= path.join(app.getPath("userData"), "app.db");
  // restante da inicializacao
});
```

Assim o arquivo fica em um diretorio gravavel mesmo apos empacotar a aplicacao.

O processo principal executa `runMigrations()` durante o evento `ready`, aplicando automaticamente novas migrations antes da interface ser aberta.
