import { Router } from "express";
import accountRountes from "./account.v2.routes";
import adminRoutes from "./admin.v2.routes";
import authRoutes from "./auth.v2.routes";
import userRoutes from "./user.v2.routes";

const v2Router = Router();

v2Router.use('/auth', authRoutes);
v2Router.use('/admin', adminRoutes);
v2Router.use('/user', userRoutes);
v2Router.use('/account', accountRountes);

export default v2Router