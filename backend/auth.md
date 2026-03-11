  -------------------------------------------------------------------------------------------------------------------------

  🎓 GUIA COMPLETO: CORRIGINDO SEU SISTEMA DE AUTH

  1️⃣ LOGOUT ENDPOINT - Por que é importante?

  O Problema:

   User faz login → Recebe access token (1h) + refresh token (7d)
   Refresh token é SALVO no banco de dados
   ↓
   User quer fazer logout, mas...
   Refresh token continua no DB indefinidamente!
   Qualquer um pode usar esse token para renovar acesso

  Solução: Criar um endpoint /auth/logout que deleta o refresh token do banco. Assim:

   POST /auth/logout (com auth)
   ↓
   Procura user no DB pelo ID do token
   ↓
   Seta refreshToken = null
   ↓
   User não consegue mais gerar novos access tokens

  Como implementar:

   // auth.controller.ts - adicione:
   export async function logoutRoute(req: any, res: any) {
     try {
       // req.user vem do authMiddleware (contém o ID do usuário)
       const user = await User.findById(req.user.id);
       
       user.refreshToken = null;
       await user.save();
       
       res.status(200).json({ message: "Logout bem-sucedido" });
     } catch (error) {
       res.status(500).json({ error: "Erro ao fazer logout" });
     }
   }

   // auth.routes.ts - adicione:
   router.post("/logout", authMiddleware, logoutRoute);

  -------------------------------------------------------------------------------------------------------------------------

  2️⃣ REFRESH TOKEN ENDPOINT - Por que precisamos?

  O Problema:

   Access token expira em 1h
   Usuário precisa fazer login de novo
   Péssima experiência!
   
   Mas espera... você TEM um refresh token!
   Ele dura 7 dias - serve exatamente para isso!

  Como funciona o fluxo ideal:

   1. User faz login
      ↓ Recebe: Access Token (1h) + Refresh Token (7d)
   
   2. Após 1h, access token expira
      ↓ User faz: POST /auth/refresh com refresh token
   
   3. Server valida refresh token
      ↓ Se válido, gera NOVO access token
      ↓ User pode continuar usando a app sem fazer login
   
   4. Após 7 dias, refresh token expira
      ↓ Aí sim, user precisa fazer login novamente

  Por que ter 2 tokens?

   - Access Token (curto): Rápido, baixa segurança necessária
   - Refresh Token (longo): Guardado no servidor, mais seguro

  Como implementar:

   // auth.controller.ts - adicione:
   export async function refreshRoute(req: any, res: any) {
     try {
       const { refreshToken } = req.body;
       
       if (!refreshToken) {
         return res.status(401).json({ error: "Refresh token ausente" });
       }
       
       // 1. Verificar assinatura do refresh token
       const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
       
       // 2. Procurar usuário no banco
       const user = await User.findById(decoded.id);
       
       if (!user || user.refreshToken !== refreshToken) {
         return res.status(401).json({ error: "Refresh token inválido" });
       }
       
       // 3. Gerar novo access token
       const newAccessToken = jwt.sign(
         { id: user._id, email: user.email },
         process.env.JWT_SECRET,
         { expiresIn: "1h" }
       );
       
       // 4. Retornar novo token
       res.cookie("accessToken", newAccessToken, {
         httpOnly: true,
         secure: process.env.NODE_ENV === "production",
         sameSite: "lax"
       });
       
       res.status(200).json({ message: "Token renovado com sucesso" });
     } catch (error) {
       res.status(401).json({ error: "Refresh token expirado" });
     }
   }

   // auth.routes.ts - adicione:
   router.post("/refresh", refreshRoute);

  No seu frontend:

   // Quando receber 401 (token expirado):
   const response = await fetch("/auth/refresh", {
     method: "POST",
     body: JSON.stringify({ refreshToken: storedRefreshToken })
   });
   // Depois tenta a requisição novamente

  -------------------------------------------------------------------------------------------------------------------------

  3️⃣ VALIDAÇÃO DE SENHA FORTE - Por que?

  O Problema:

   Sua validação atual:
   - Mínimo 8 caracteres
   
   User pode escolher: "12345678" ou "aaaaaaaa"
   Péssimo! Senhas fracas são hackeadas em SEGUNDOS

  Senhas fortes precisam de:

   - ✅ Pelo menos 8 caracteres
   - ✅ Pelo menos 1 MAIÚSCULA (A-Z)
   - ✅ Pelo menos 1 minúscula (a-z)
   - ✅ Pelo menos 1 número (0-9)
   - ✅ Pelo menos 1 símbolo especial (!@#$%&*)

  Como implementar:

   // auth.controller.ts - adicione função helper:
   function validatePasswordStrength(password: string): { valid: boolean; error?: string } {
     const minLength = 8;
     const hasUpperCase = /[A-Z]/.test(password);
     const hasLowerCase = /[a-z]/.test(password);
     const hasNumbers = /\d/.test(password);
     const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
     
     if (password.length < minLength) {
       return { valid: false, error: `Mínimo ${minLength} caracteres` };
     }
     if (!hasUpperCase) {
       return { valid: false, error: "Precisa de pelo menos 1 letra MAIÚSCULA" };
     }
     if (!hasLowerCase) {
       return { valid: false, error: "Precisa de pelo menos 1 letra minúscula" };
     }
     if (!hasNumbers) {
       return { valid: false, error: "Precisa de pelo menos 1 número" };
     }
     if (!hasSpecialChar) {
       return { valid: false, error: "Precisa de pelo menos 1 símbolo especial (!@#$%^&*)" };
     }
     
     return { valid: true };
   }
   
   // Usar no register:
   export async function registerRoute(req: any, res: any) {
     const { name, email, password } = req.body;
     
     // Validar força da senha
     const passwordValidation = validatePasswordStrength(password);
     if (!passwordValidation.valid) {
       return res.status(400).json({ error: passwordValidation.error });
     }
     
     // ... resto do código
   }

  -------------------------------------------------------------------------------------------------------------------------

  4️⃣ RATE LIMITING - Por que é crítico?

  O Problema:

   Seu login endpoint NÃO tem proteção!
   Hacker pode tentar 10.000 senhas por segundo:
   
   for (i = 0; i < 10000; i++) {
     POST /auth/login { email: "user@mail.com", password: generate() }
   }
   
   Sem rate limit, ele consegue!

  Solução: Rate limiting = "limite de tentativas por IP"

   Limite: 5 tentativas de login por IP a cada 15 minutos
   Se ultrapassar → bloqueado por 15 minutos

  Como implementar:

   // server.ts - no início do arquivo:
   import rateLimit from "express-rate-limit";
   
   // Criar limitador para login
   const loginLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutos
     max: 5, // Máximo 5 requisições
     message: "Muitas tentativas de login. Tente novamente em 15 minutos.",
     standardHeaders: true,
     legacyHeaders: false,
   });
   
   // Criar limitador para registro
   const registerLimiter = rateLimit({
     windowMs: 60 * 60 * 1000, // 1 hora
     max: 3, // Máximo 3 registros
     message: "Muitas tentativas de registro. Tente novamente em 1 hora.",
   });
   
   app.post("/auth/login", loginLimiter, loginRoute);
   app.post("/auth/register", registerLimiter, registerRoute);

  -------------------------------------------------------------------------------------------------------------------------

  5️⃣ HELMET - Headers de Segurança

  O Problema:

   Seu servidor envia headers genéricos que revelam vulnerabilidades:
   - X-Powered-By: Express
   - Sem X-Frame-Options
   - Sem Content-Security-Policy
   
   Hackers sabem exatamente que é Express e qual versão!

  Solução: Helmet adiciona headers de segurança automaticamente:

   // server.ts - no início:
   import helmet from "helmet";
   
   app.use(helmet());
   
   // Isso adiciona automaticamente:
   // - X-Frame-Options: DENY (previne clickjacking)
   // - X-Content-Type-Options: nosniff (previne MIME type sniffing)
   // - Content-Security-Policy: padrão seguro
   // - Strict-Transport-Security: força HTTPS
   // ... e mais 10 outras proteções

  -------------------------------------------------------------------------------------------------------------------------

  6️⃣ FIXAR JWT PAYLOAD INCONSISTÊNCIA

  O Problema:

   Login gera: { id, email }
   Middleware espera: { sub, email }
   
   Sub é o padrão JWT! (Subject = quem é o token)
   id não é standard - varia por implementação

  Solução: Padronizar usando sub:

   // auth.controller.ts - ao gerar token:
   const accessToken = jwt.sign(
     { 
       sub: user._id.toString(), // ✅ Standard JWT
       email: user.email 
     },
     process.env.JWT_SECRET,
     { expiresIn: "1h" }
   );
   
   // auth.middleware.ts - ao validar:
   export function authMiddleware(req: any, res: any, next: any) {
     const token = req.headers.authorization?.split(" ")[1];
     
     if (!token) {
       return res.status(401).json({ error: "Token ausente" });
     }
     
     try {
       const decoded = jwt.verify(token, process.env.JWT_SECRET);
       req.user = {
         id: decoded.sub, // ✅ Extrair do 'sub'
         email: decoded.email
       };
       next();
     } catch {
       res.status(401).json({ error: "Token inválido" });
     }
   }

  -------------------------------------------------------------------------------------------------------------------------

  7️⃣ REMOVER BCRYPTJS DUPLICADO

  O Problema:

   {
     "bcrypt": "^6.0.0",      // Instalado mas não usado
     "bcryptjs": "^3.0.3"     // Esse sim é usado
   }

  Solução:

   npm uninstall bcrypt
   # ou com pnpm (que você usa):
   pnpm remove bcrypt

  -------------------------------------------------------------------------------------------------------------------------

  📋 RESUMO - ORDEM DE IMPLEMENTAÇÃO:

   1. Primeiro: Fixar JWT payload (sub vs id) - mudança pequena
   2. Segundo: Remover bcrypt duplicado - trivial
   3. Terceiro: Adicionar Helmet - 1 linha
   4. Quarto: Adicionar Rate Limiting - 10 linhas
   5. Quinto: Validação de senha forte - 30 linhas
   6. Sexto: Refresh token endpoint - 25 linhas
   7. Sétimo: Logout endpoint - 15 linhas
   8. Oitavo: Escrever testes - mais complexo, faça depois