import "dotenv/config"
import validator from 'validator';
import { type RequestHandler } from "express";
import { User } from '../models/user.model.js';
import type { JwtPayload } from '../types/auth.types.js';
import { SignJWT, jwtVerify } from 'jose';
import { createLogger } from '../utils/logger.js';

const adminKey = new TextEncoder().encode(process.env.ADMIN_SECRET);
const jwtKey = new TextEncoder().encode(process.env.JWT_SECRET);
const refreshKey = new TextEncoder().encode(process.env.REFRESH_SECRET);

const logger = createLogger("AUTH")

export const loginRoute: RequestHandler = async (req, res) => {
  const authHeader = req.headers.authorization;
  if(authHeader?.startsWith("Bearer ")){
    const token = authHeader.split(" ")[1] as string;
    try {
      const { payload } = await jwtVerify(token, jwtKey) as unknown as { payload: JwtPayload };
      if (!payload) {
        res.status(400).json({error: "O token não foi validado pelo servidor"});
        return 
      }
      const user = await User.findOne({ email: payload.email });
      if (!user) { res.status(400).json({error: "Credenciais Inválidas"}); return; }
      res.status(200).json({ message: "Login bem-sucedido!"});
      return;
    } catch (err: any) {
      res.status(401).json({error: "Token inválido"});
      return 
    }
  } else { 
    const { email, password } = req.body;
    if (!email || !password || !validator.isEmail(email)){
      res.status(401).json({error: "Insira email e senha!!!"});
      return;
    };
    const user = await User.findOne({ email: email});

    const isMatch = await user?.comparePassword(password);

    if (!user || !isMatch){
      res.status(400).json({ error: "Email ou senha incorreto"});
      return;
    }

    const accessToken = await createToken(
      { sub: user._id.toString(), email: user.email },
      jwtKey,
      "1h"
    );

    const refreshToken = await createToken(
      { id: user._id.toString() },
      refreshKey,
      "7d"
    );

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("accessToken", accessToken, {
      maxAge: 60 * 60 * 1000, 
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, 
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    
    res.status(200).json({ message: "Login bem-sucedido!"});
    return ;
  }
};

export const registerRoute: RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  const adminToken = req.cookies.adminToken;
  
  if ( !email || !password || !validator.isEmail(email)){ 
    res.status(401).json({ error : "Insira um nome, email e senha"}); 
    return;
  };

  const verifyPasswordResult = verifyPassword(password);
  if (!verifyPasswordResult.valid){
    res.status(400).json({ error: verifyPasswordResult.error });
    return;
  }

  const existingUser = await User.findOne({ email: email });
  if (existingUser){
    res.status(400).json({ error: "Email já cadastrado!"});
    return;
  }

  let role = "Client";

  try{
    if(await jwtVerify(adminToken, adminKey)){
      role = "admin";
    }
  } catch (err: any){
    logger.warn(`We have an error ${err.message}`)
  }

  const newUser = new User({ email, password, role });
  await newUser.save();
  
  const accessToken = await createToken(
    { sub: newUser._id.toString(), email },
    jwtKey,
    "1h"
  );

  const refreshToken = await createToken(
    { id: newUser._id.toString() },
    refreshKey,
    "7d"
  );
  newUser.refreshToken = refreshToken;
  await newUser.save();

  res.cookie("accessToken", accessToken, {
      maxAge: 60 * 60 * 1000, 
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
  });

  res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, 
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: 'strict'
  });
  res.status(201).json({ message: "Usuario criado com sucesso!" });
  return
};

export const logoutRoute: RequestHandler = async (req, res) => {
  try{
    const refreshToken = req.cookies.refreshToken;
  if (!refreshToken){
    res.status(400).json({ error: "Nenhum token de atualização encontrado!"});
    return;
  }

  const user = await User.findOne({ refreshToken: refreshToken });
  if (!user){
    res.status(400).json({ error: "Token de atualização inválido!"});
    return ;
  }

  user.refreshToken = null;
  await user.save();

  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });

  res.status(200).json({ message: "Logout bem-sucedido!" });
  return;  
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao fazer logout: " + err.message });
    return;
  }
};

export const refreshRoute: RequestHandler = async (req, res) => {
  const oldRefreshToken = req.cookies.refreshToken;
  if (!oldRefreshToken){
    res.status(400).json({ error: "Nenhum token de atualização fornecido!"});
    return ;
  };
  const user = await User.findOne({ refreshToken: oldRefreshToken });
  if (!user){
    res.status(400).json({ error: "Token de atualização inválido!"});
    return ;
  }

  try {
    await jwtVerify(oldRefreshToken, refreshKey);
    const newAccessToken = await createToken(
      { id: user._id.toString(), email: user.email },
      jwtKey,
      "1h"
    );

    const refreshToken = await createToken(
      { id: user._id.toString() },
      refreshKey,
      "7d"
    );

    user.refreshToken = refreshToken;
    await user.save();
    
    res.cookie("accessToken", newAccessToken, {
      maxAge: 60 * 60 * 1000,
      httpOnly: true, 
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, 
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    
    res.status(200).json({ message: "Refresh enviado com sucesso" });
    return;
  } catch (err: any) {
    res.status(400).json({ error: "Token de atualização inválido!" });
    return ;
  }
};

function verifyPassword(password: string): {valid: boolean, error?: string} {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (password.length < minLength) {
    return { valid: false, error: "A senha deve conter no mínimo 8 caracteres!" };
  }
  if (!hasUpperCase) {
    return { valid: false, error: "A senha deve conter pelo menos uma letra maiúscula!" };
  }
  if (!hasLowerCase) {
    return { valid: false, error: "A senha deve conter pelo menos uma letra minúscula!" };
  }
  if (!hasNumbers) {
    return { valid: false, error: "A senha deve conter pelo menos um número!" };
  }
  if (!hasSpecialChar) {
    return { valid: false, error: "A senha deve conter pelo menos um caractere especial!" };
  }
  return { valid: true };
};

async function createToken(
  payload: Record<string, unknown>,
  key: Uint8Array,
  expiresIn: string,
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(key);
}
