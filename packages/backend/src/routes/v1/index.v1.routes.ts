import { Router } from "express";
import { requireLoggedInUser, requireRole } from "../../middleware/v1/auth.v1.middleware";
import accountRoutes from "./account.v1.routes";
import adminRoutes from "./admin.v1.routes";
import authRoutes from "./auth.v1.routes";
import systemRoutes from "./system.v1.routes";
import userRoutes from "./user.v1.routes";

const v1Router = Router();

v1Router.use('/auth', authRoutes);
v1Router.use('/user', requireLoggedInUser, requireRole(['USER']), userRoutes);
v1Router.use('/account', requireLoggedInUser, requireRole(['USER']), accountRoutes);
v1Router.use('/admin', requireLoggedInUser, requireRole(['ADMIN']), adminRoutes);
v1Router.use('/system', systemRoutes);

export default v1Router