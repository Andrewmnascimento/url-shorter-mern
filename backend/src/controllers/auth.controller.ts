import jwt from 'jsonwebtoken';
import validator from 'validator';
import type { Request, Response} from "express";
import { User } from '../models/user.model.js';
import type { JwtPayload } from '../types/auth.types.js';

export const loginRoute = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if(authHeader?.startsWith("Bearer ")){
    if (!authHeader) return res.status(401).json({error: "Não existe token"});
    const token = authHeader.split(" ")[1] as string;
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
      if (!payload) return res.status(400).json({error: "O token não foi validado pelo servidor"});
      const user = await User.findOne({ email: payload.email });
      if (!user) return res.status(400).json({error: "Não existe esse usuario"});
      return res.status(200).json({ message: "Login bem-sucedido!"});
    } catch (err: any) {
      return res.status(401).json({error: "Token inválido"});
    }
  } else { 
    const { email, password } = req.body;
    if (!email || !password || !validator.isEmail(email)){
      return res.status(401).json({error: "Insira email e senha!!!"});
    };
    const user = await User.findOne({ email: email});
    if (!user){
      return res.status(401).json({ error: "Não existe usuario com esse email"});
    }

    const isMatch = await user.comparePassword(password);

    if(!isMatch){
      return res.status(400).json({error: "A senha está incorreta!"});
    }

    const accessToken = jwt.sign(
      {sub: user._id.toString(), email: user.email},
      process.env.JWT_SECRET!,
      {expiresIn: "1h"}
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_SECRET!,
      { expiresIn: "7d"}
    );

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("accessToken", accessToken, {
      maxAge: 60 * 60 * 1000, 
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax'
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, 
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax'
    });
    
    return res.status(200).json({ message: "Login bem-sucedido!"});
  }
};

export const registerRoute = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if ( !email || !password || !validator.isEmail(email)){ 
    return res.status(401).json({ error : "Insira um nome, email e senha"}); 
  };

  const verifyPasswordResult = verifyPassword(password);
  if (!verifyPasswordResult.valid){
    return res.status(400).json({ error: verifyPasswordResult.error });
  }

  const existingUser = await User.findOne({ email: email });
  if (existingUser){
    return res.status(400).json({ error: "Email já cadastrado!"});
  }
  
  const newUser = new User({ email, password });
  await newUser.save();
  return res.status(201).json({ message: "Usuario criado com sucesso!" });
};

export const logoutRoute = async (req: Request, res: Response) => {
  try{
    const refreshToken = req.cookies.refreshToken;
  if (!refreshToken){
    return res.status(400).json({ error: "Nenhum token de atualização encontrado!"});
  }

  const user = await User.findOne({ refreshToken: refreshToken });
  if (!user){
    return res.status(400).json({ error: "Token de atualização inválido!"});
  }

  user.refreshToken = null;
  await user.save();

  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });

  return res.status(200).json({ message: "Logout bem-sucedido!" });
  } catch (err: any) {
    return res.status(500).json({ error: "Erro ao fazer logout: " + err.message });
  }
};

export const refreshRoute = async (req: Request, res: Response) => {
  const refreshToken = req.body;
  if (!refreshToken){
    return res.status(400).json({ error: "Nenhum token de atualização fornecido!"});
  };
  const user = await User.findOne({ refreshToken: refreshToken });
  if (!user){
    return res.status(400).json({ error: "Token de atualização inválido!"});
  }

  try {
    jwt.verify(refreshToken, process.env.REFRESH_SECRET!);
    const newAccessToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );
    return res.status(200).json({ accessToken: newAccessToken });
  } catch (err: any) {
    return res.status(400).json({ error: "Token de atualização inválido!" });
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