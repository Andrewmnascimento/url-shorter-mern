import { SignJWT } from "jose"; 
import "dotenv/config"

const adminKey = new TextEncoder().encode(process.env.ADMIN_SECRET);

const email = process.argv[1] as string;

const createAdminToken = async (email: string) => {
  const jwt = await new SignJWT({email: email})
    .setProtectedHeader({ alg: 'HS256'})
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(adminKey)
  console.log(jwt);

}

createAdminToken(email);

