# Guia de Implantação Oficial - Firebase & Publicação em Produção

Este guia detalha o passo a passo para criar o projeto oficial no Google Firebase, ativar todos os serviços em nuvem (Autenticação, Banco de Dados, Upload de Fotos e Hospedagem), cadastrar múltiplos controladores/supervisores e publicar a aplicação em produção.

---

## 🛠️ Passo 1: Criar o Projeto no Console do Firebase

1. Acesse o [Console do Firebase](https://console.firebase.google.com/) com sua conta Google.
2. Clique em **"Adicionar projeto"** (ou "Criar um projeto").
3. Digite o nome do projeto (ex: `gestao-frota-trânsito`) e clique em **Continuar**.
4. *(Opcional)* Ative ou desative o Google Analytics para o projeto e clique em **Criar projeto**.
5. Aguarde alguns segundos e clique em **Continuar** para entrar no painel do seu projeto.

---

## 🔐 Passo 2: Ativar os Serviços do Firebase em Nuvem

### 1. Firebase Authentication & Gestão de Acesso Seguro (Supervisores e Agentes)
Para permitir a autenticação segura dos dispositivos móveis e dos supervisores no sistema:
1. No menu lateral esquerdo, sob a seção **Build** (Construção), clique em **Authentication**.
2. Clique no botão **Começar** (Get Started).
3. Na aba **Método de login**, você deve ativar dois provedores:
   - **E-mail/senha**: Clique em **E-mail/senha**, ative a primeira chave de ativação (**E-mail/senha**) e clique em **Salvar**. *(Necessário para os supervisores entrarem no painel).*
   - **Anônimo (Anonymous)**: Clique em **Adicionar novo provedor**, selecione **Anônimo**, ative a chave de ativação correspondente e clique em **Salvar**. *(CRÍTICO: Necessário para a autorização inicial e funcionamento reativo do celular dos agentes de rua).*
4. **Cadastrar Múltiplos Controladores (Supervisores):**
   - Acesse a aba **Users** (Usuários) no topo da tela de Authentication.
   - Clique no botão **Adicionar usuário**.
   - Digite o e-mail do primeiro controlador (ex: `controlador1@frota.com`) e insira a senha dele (ex: `senhaControlador1`). Clique em **Adicionar usuário**.
   - Repita o processo clicando em **Adicionar usuário** para cadastrar o segundo controlador (ex: `controlador2@frota.com`) com a senha dele, e assim sucessivamente.
   - *Nota: Cada controlador adicionado na lista poderá fazer login no sistema (`controlador.html`) de forma independente utilizando seu próprio e-mail e a senha definida!*

> [!TIP]
> **Como redefinir ou alterar a senha de um Controlador:**
> Caso algum controlador queira trocar de senha ou a tenha esquecido, o administrador do sistema pode acessar esta mesma lista de usuários no Firebase Console, clicar nos **três pontinhos** ao lado do e-mail do controlador, e selecionar **"Redefinir senha"** ou **"Alterar senha"** de forma instantânea!

### 2. Cloud Firestore (Banco de Dados em Tempo Real)
Para persistir os dados reativos em tempo real:
1. No menu lateral sob **Build**, clique em **Firestore Database**.
2. Clique em **Criar banco de dados**.
3. Selecione a **Localização do banco de dados** (recomendado: `southamerica-east1` em São Paulo, ou `us-central` para custo reduzido) e clique em **Avançar**.
4. Selecione a opção **Iniciar no modo de teste** (para desenvolvimento rápido) e clique em **Criar**.
5. Uma vez criado, acesse a aba **Regras** (Rules) no topo e certifique-se de que a leitura e escrita estão ativas. Exemplo de regras simplificadas de desenvolvimento:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
   *Nota: Clique em **Publicar** caso faça alguma alteração nas regras.*

### 3. Firebase Storage (Upload de Fotos Reais)
Para armazenar as fotos de vistoria e de avarias enviadas pelos agentes do celular:
1. No menu lateral sob **Build**, clique em **Storage**.
2. Clique em **Começar** (Get Started).
3. Clique em **Avançar** e depois em **Concluído**.
4. Acesse a aba **Regras** (Rules) do Storage no topo e atualize a regra para permitir o upload de fotos de forma pública ou autenticada:
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if true;
       }
     }
   }
   ```
   *Nota: Clique em **Publicar** para salvar as regras de Storage.*

---

## 🔑 Passo 3: Registrar o Aplicativo Web e Obter as Chaves

1. Na página inicial do painel do seu projeto no Firebase, clique no ícone **Web (</>)** para registrar um aplicativo.
2. Dê um apelido ao aplicativo (ex: `Gestao Frota Web`) e **marque a caixa** *"Configurar também o Firebase Hosting para este aplicativo"*.
3. Clique em **Registrar aplicativo**.
4. O Firebase exibirá um código contendo o objeto `firebaseConfig`. Copie apenas as propriedades desse objeto:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "seu-projeto.firebaseapp.com",
     projectId: "seu-projeto",
     storageBucket: "seu-projeto.appspot.com",
     messagingSenderId: "1234567890",
     appId: "1:1234567890:web:abcdef..."
   };
   ```
5. Abra o arquivo [firebase.js](file:///home/rafael/Documents/gest%C3%A3o%20frota/firebase.js) do seu projeto.
6. Substitua os placeholders correspondentes (linhas 14-21) pelas suas credenciais copiadas:
   ```javascript
   const firebaseConfig = {
     apiKey: "SUA_API_KEY_COPIADA",
     authDomain: "SEU_AUTH_DOMAIN_COPIADO",
     projectId: "SEU_PROJECT_ID_COPIADO",
     storageBucket: "SEU_STORAGE_BUCKET_COPIADO",
     messagingSenderId: "SEU_MESSAGING_SENDER_ID_COPIADO",
     appId: "SEU_APP_ID_COPIADO"
   };
   ```
7. Salve o arquivo. **O sistema detectará automaticamente as chaves e desativará o Modo de Demonstração (Demo Mode), conectando-se diretamente ao seu servidor de produção em nuvem do Firebase!**

---

## 🚀 Passo 4: Publicar o Site de Graça (Firebase Hosting)

Para que qualquer agente ou controlador possa acessar o sistema de qualquer lugar via internet (celular ou computador) através de um link seguro `https://`:

1. Abra um terminal na pasta do seu projeto (`/home/rafael/Documents/gestão frota`).
2. Se você não tiver a ferramenta do Firebase instalada, execute o comando para instalá-la globalmente no seu computador:
   ```bash
   npm install -g firebase-tools
   ```
3. Realize o login no Firebase via terminal:
   ```bash
   firebase login
   ```
   *(Uma janela do navegador se abrirá para você autorizar o login com sua conta do Google).*
4. Inicialize o projeto da pasta executando:
   ```bash
   firebase init
   ```
5. Responda às perguntas interativas do terminal da seguinte forma:
   - **Selecione os recursos:** Use as setas do teclado e a barra de espaço para marcar a opção `Hosting: Configure files for Firebase Hosting...` e pressione Enter.
   - **Associação de Projeto:** Escolha `Use an existing project` (Usar um projeto existente) e selecione o projeto que você criou no Passo 1.
   - **Diretório Público:** Digite `.` (ponto) e pressione Enter, pois seus arquivos HTML (`index.html`, `controlador.html` e `firebase.js`) estão localizados diretamente na raiz do diretório.
   - **Configure as single-page app (Rewrite URLs)?** Digite `N` (Não) e pressione Enter.
   - **Set up automatic builds and deploys with GitHub?** Digite `N` (Não) e pressione Enter.
   - **File index.html already exists. Overwrite?** Digite `N` (Não) e pressione Enter para **NÃO** apagar a tela do seu celular!
6. Agora, execute o comando de publicação oficial:
   ```bash
   firebase deploy
   ```
7. O terminal começará o upload dos arquivos e, ao finalizar, exibirá a **Hosting URL** oficial do seu aplicativo (ex: `https://seu-projeto.web.app`).

**Pronto! O sistema estará 100% publicado e online! O celular do agente (`index.html`) e a tela do supervisor (`controlador.html`) estarão rodando de forma corporativa integrada ao vivo com upload de fotos reais no Storage!**
